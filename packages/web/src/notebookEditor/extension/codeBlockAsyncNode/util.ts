import { Editor } from '@tiptap/core';
import { NodeSelection } from 'prosemirror-state';

import { hashString, isBlank, isCodeBlockNode, CodeBlockAsyncNodeType, CodeBlockNodeType, CodeBlockReference, NodeName, EMPTY_CODEBLOCK_HASH, REMOVED_CODEBLOCK_VISUALID } from '@ureeka-notebook/web-service';

import { getCodeBlockViewStorage } from 'notebookEditor/extension/codeblock/nodeView/storage';
import { visualIdFromCodeBlockReference } from 'notebookEditor/extension/codeBlockReference/util';
import { HISTORY_META } from 'notebookEditor/extension/history/History';
import { resolveNewSelection } from 'notebookEditor/extension/util/node';

// ********************************************************************************
// == Async =======================================================================
export const replaceInlineCodeBlockAsyncNode = (editor: Editor, newAsyncNode: CodeBlockAsyncNodeType, replacementPosition: number) =>
  editor.chain()
        .command(({ tr }) => {
          const replacedNodePos = tr.doc.resolve(replacementPosition);
                tr.setSelection(new NodeSelection(replacedNodePos))
                  .replaceSelectionWith(newAsyncNode)
                  .setSelection(resolveNewSelection(editor.state.selection, tr));
          return true/*successfully replaced async node*/;
        })
        .setMeta(HISTORY_META, false/*once executed, an async node cannot go back to non-executed*/)
        .run();

// == Visual Id ===================================================================
// Gets the visual ids from the code block references given.
// NOTE: The order and duplicated values are preserved.
export const visualIdsFromCodeBlockReferences = (editor: Editor, codeBlockReferences: CodeBlockReference[]) => {
  const visualIds = codeBlockReferences.map(codeBlockReference => {
    const visualId = visualIdFromCodeBlockReference(editor, codeBlockReference);
    if(!visualId) return REMOVED_CODEBLOCK_VISUALID/*codeBlockReference got removed*/;
    return visualId;
  });

  return visualIds;
};

// == Hash ========================================================================
// Gets the hashes from the code block references given.
// NOTE: The order and duplicated values are preserved.
export const hashesFromCodeBlockReferences = (editor: Editor, codeBlockReferences: CodeBlockReference[]) => {
  const newCodeBlockHashes = codeBlockReferences.map(codeBlockReference => hashFromCodeBlockReference(editor, codeBlockReference));

  return newCodeBlockHashes;
};

const hashFromCodeBlockReference = (editor: Editor, codeBlockReference: CodeBlockReference) => {
  const codeBlockStorage = getCodeBlockViewStorage(editor),
        codeBlockView = codeBlockStorage.getNodeView(codeBlockReference);
  if(!codeBlockView) throw new Error(`${NodeName.CODEBLOCK} (${codeBlockReference}) no longer exists.`);
  if(!isCodeBlockNode(codeBlockView.node))  throw new Error(`codeBlockReference (${codeBlockReference}) is not a ${NodeName.CODEBLOCK} node.`);

  return codeBlockHash(codeBlockView.node);
};

export const codeBlockHash = (node: CodeBlockNodeType) => {
  let { textContent } = node;
  return isBlank(textContent) ? EMPTY_CODEBLOCK_HASH : hashString(textContent);
};
