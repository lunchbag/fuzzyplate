'use strict';

(function () {
  var Evernote = require('evernote').Evernote
  , config = require('./config.json')
  , _ = require('underscore')
  , parseString = require('xml2js').parseString;

  // PRIVATE

  /*
   *  getNoteStore (req)
   *    returns evernote NoteStore if it exists (if authenticated)
   *    returns null otherwise
   */

  var getNoteStore = function (req) {
    if (config.OAUTH_ACCESS_TOKEN) {
      var client = new Evernote.Client({
        token: config.OAUTH_ACCESS_TOKEN,
        sandbox: config.SANDBOX
      });
      return client.getNoteStore();
    } else {
      return null;
    }
  }

  /*
   *  getFuzzyNotebookGuid (noteStore, req, cb)
   *    gets the FuzzyPlates Subscribers notebook GUID. If it doesn't exist,
   *      calls to create it
   *    returns notebook GUID
   */

  var getFuzzyNotebookGuid = function(noteStore, req, cb) {
    noteStore.listNotebooks(function (err, notebooks) {
      var fuzzy = _.findWhere(notebooks, { name: 'FuzzyPlates Subscribers' });
      if (typeof fuzzy != 'undefined') {
        cb(fuzzy.guid);
      } else {
        createFuzzyNotebook(noteStore, req, cb);
      }
    });
  }

  /*
   *  createFuzzyNotebook (noteStore, req, cb)
   *    creates the FuzzyPlates Subscribers notebook
   *    returns notebook GUID
   */

  var createFuzzyNotebook = function (noteStore, req, cb) {
    var notebook = new Evernote.Notebook();
    notebook.name = "FuzzyPlates Subscribers";
    noteStore.createNotebook(notebook, function (err, notebook) {
      if (err.errorCode) {
        console.log(err);
        cb(null);
      } else {
        cb(notebook.guid);
      }
    });
  }

  /*
   *  getNoteGuid (noteStore, req, cb)
   *    gets the right Subscribers note GUID. If it doesn't exist, calls to
   *      create the note
   *    returns note GUID
   */

  var getNoteGuid = function (noteStore, notebookGuid, cb) {
    // Define the note we're looking for
    var ourNote = new Evernote.NoteFilter();
    ourNote.notebookGuid = notebookGuid;

    // Define our filter specs (we only want the title)
    var resultSpec = new Evernote.NotesMetadataResultSpec();
    resultSpec.includeTitle = true;

    var offset = 0;
    var limit = 100;
    noteStore.findNotesMetadata(ourNote, offset, limit, resultSpec, function (err, notes) {
      if (err) {
        console.log(err);
        cb(null);
      } else {
        var note = _.findWhere(notes.notes, { title: config.PROJECT_NAME + ' Subscribers' });
        if (typeof note != 'undefined') {
          cb(note.guid);
        } else {
          makeNote(noteStore, config.PROJECT_NAME + ' Subscribers', '', notebookGuid, cb);
        }
      }

    })
  }

  /*
   *  makeNote (noteStore, noteTitle, noteBoy, notebookGuid, req, cb)
   *    creates the right project's Subscribers note
   *    returns note GUID
   */

  var makeNote = function (noteStore, noteTitle, noteBody, notebookGuid, cb) {
    // Create note object
    var ourNote = new Evernote.Note();
    ourNote.title = noteTitle;
    ourNote.content = constructXMLNoteContent(noteBody);
    ourNote.notebookGuid = notebookGuid;

    // Attempt to create note in Evernote account
    noteStore.createNote(ourNote, function (err, note) {
      if (err) {
        console.log(err);
        cb(null);
      } else {
        cb(note.guid);
      }
    });
  }

  /*
   *  appendToNote (noteStore, noteGuid, content, cb)
   *    appends content to an existing note
   *    returns true if success, false otherwise
   */

  var appendToNote = function (noteStore, noteGuid, content, cb) {
    noteStore.getNoteContent(noteGuid, function (err, note){
      // Get the body of the note's content
      parseString(note, function (err, result) {
        content = result['en-note'] + " " + content
      });

      // Construct note filters in order to update the right one
      var ourNote = new Evernote.Note();
      ourNote.title = config.PROJECT_NAME + ' Subscribers';
      ourNote.guid = noteGuid;
      ourNote.content = constructXMLNoteContent(content);

      noteStore.updateNote(ourNote, function (err, note){
        if (err) {
          console.log(err);
          cb(null);
        } else {
          cb(true);
        }
      })

    })
  }

  /*
   *  constructXMLNoteContent (content, cb)
   *    returns an XML/Evernote content friendly string
   */

  var constructXMLNoteContent = function (content, cb) {
    return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
           "<!DOCTYPE en-note SYSTEM \"http://xml.evernote.com/pub/enml2.dtd\">" +
           "<en-note>" +
           content +
           "</en-note>";
  };

  /*
   *  add_subscriber (noteStore, noteGuid, content, cb)
   *    appends content to an existing note
   *    returns true if success, false otherwise
   */

  exports.addSubscriber = function (req, res, cb) {
    var noteStore = getNoteStore(req);
    if (noteStore != null) {
      // Get the right notebook GUID
      getFuzzyNotebookGuid(noteStore, req.query.email, function (notebookGuid) {
        // Get the right note GUID
        getNoteGuid(noteStore, notebookGuid, function (noteGuid) {
          // Append e-mail to the note
          appendToNote(noteStore, noteGuid, req.query.email, function (success) {
            if (success) {
              cb("Thanks for signing up– we'll notify you by e-mail when we're ready for you!")
            } else {
              cb("Something went wrong! Please let us know via Twitter.");
            }
          });
        });
      });
    } else {
      cb("Something went wrong! Please let us know via Twitter.");
    }
  };

}());