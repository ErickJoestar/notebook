import { httpsCallable } from 'firebase/functions';

import { NotebookEditorInsertNumbers_Rest, NotebookEditorInsertText_Rest, NotebookIdentifier } from '@ureeka-notebook/service-common';

import { functions } from '../util/firebase';
import { wrapHttpsCallable } from '../util/function';

// ** Auth'd User *****************************************************************
// == Notebook Editor =============================================================
export const notebookEditorInsertNumbers = wrapHttpsCallable<NotebookEditorInsertNumbers_Rest, NotebookIdentifier>(httpsCallable(functions, 'notebookEditorInsertNumbers'));

export const notebookEditorInsertText = wrapHttpsCallable<NotebookEditorInsertText_Rest, NotebookIdentifier>(httpsCallable(functions, 'notebookEditorInsertText'));
