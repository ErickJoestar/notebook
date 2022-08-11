import { logger } from 'firebase-functions';
import { EditorState } from 'prosemirror-state';

import { findNodeById, isDemoAsyncNode, AsyncNodeStatus, AttributeType, NodeIdentifier, CodeBlockAsyncNodeType } from '@ureeka-notebook/service-common';

import { ApplicationError } from '../../util/error';
import { DocumentUpdate } from './type';

// ********************************************************************************
/** Updates the identified DemoAsyncNode with the specified status and text */
export class DemoAsyncNodeAttributeReplace implements DocumentUpdate {
  public constructor(private readonly nodeId: NodeIdentifier, private readonly status: AsyncNodeStatus, private readonly text?: string) {/*nothing additional*/}

  // == DocumentUpdate ============================================================
  public update(editorState: EditorState) {
// FINISH!
//    const { tr } = editorState;

    // get the Demo Async Node for the Node Identifier
    const nodeFound = findNodeById(editorState, this.nodeId);
    if(!nodeFound) throw new ApplicationError('functions/not-found', `Cannot Replace Attributes in non-existing Demo Async Node (${this.nodeId}).`);
    const { node, position } = nodeFound;
    if(!isDemoAsyncNode(node)) throw new ApplicationError('functions/invalid-argument', `Node (${this.nodeId}) is not a Demo Async Node.`);

    const newNode = node.copy() as CodeBlockAsyncNodeType/*guaranteed by above check*/;
          // NOTE: AttributeType.CodeBlockHashes remain unchanged
          newNode.attrs[AttributeType.Status] = this.status;
          newNode.attrs[AttributeType.Text] = (this.status === AsyncNodeStatus.SUCCESS) ? this.text : 'Error'/*CHECK: what else?*/;

logger.debug(position);
    // FINISH!!!!
    // tr.doc.resolve(replacementPosition);
    //       tr.setSelection(new NodeSelection(replacedNodePos))
    //         .replaceSelectionWith(newNode)
    //         .setSelection(resolveNewSelection(editor.state.selection, tr));
  }
}
