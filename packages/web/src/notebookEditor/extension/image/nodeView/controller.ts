import { Editor } from '@tiptap/core';

import { defaultImageAttributes, getDownloadURL, getPosType, lastValueFrom, AssetService, AttributeType, ImageNodeType, NodeName, SetNodeSelectionDocumentUpdate, UpdateAttributesDocumentUpdate, DEFAULT_IMAGE_WIDTH, DEFAULT_IMAGE_HEIGHT } from '@ureeka-notebook/web-service';

import { applyDocumentUpdates } from 'notebookEditor/command/update';
import { AbstractNodeController } from 'notebookEditor/model/AbstractNodeController';

import { getImageMeta, fitImageDimension } from '../util';
import { ImageModel } from './model';
import { ImageStorage } from './storage';
import { ImageView } from './view';

// ********************************************************************************
export class ImageController extends AbstractNodeController<ImageNodeType, ImageStorage, ImageModel, ImageView> {
  // == Lifecycle =================================================================
  public constructor(editor: Editor, node: ImageNodeType, storage: ImageStorage, getPos: getPosType) {
    const model = new ImageModel(editor, node, storage, getPos),
          view = new ImageView(model, editor, node, storage, getPos);

    super(model, view, editor, node, storage, getPos);

    if(!this.node.attrs[AttributeType.Uploaded]) {
      this.uploadImage();
    } /* else -- this Image has already been uploaded to Storage, do nothing */
  }

  private async uploadImage() {
    const src = this.node.attrs[AttributeType.Src];
    if(!src) return/*invalid src, nothing to do*/;

    try {
      const img = await getImageMeta(src);
      const { fittedWidth: width, fittedHeight: height } = fitImageDimension(img);

      const blobResponse = await fetch(src);
      const blob = await blobResponse.blob();

      const firstSnapshot = await lastValueFrom(AssetService.getInstance().upload$(blob));
      const storageUrl = await getDownloadURL(firstSnapshot.ref);

      applyDocumentUpdates(this.editor, [
        new SetNodeSelectionDocumentUpdate(this.getPos()),
        new UpdateAttributesDocumentUpdate(NodeName.IMAGE, { ...defaultImageAttributes, src: storageUrl, width, height, uploaded: true/*uploaded to Storage*/ }),
      ]);
    } catch(error) {
      // if unable to load and fit, use defaults
      applyDocumentUpdates(this.editor, [
        new SetNodeSelectionDocumentUpdate(this.getPos()),
        new UpdateAttributesDocumentUpdate(NodeName.IMAGE, { ...defaultImageAttributes, src, width: DEFAULT_IMAGE_WIDTH, height: DEFAULT_IMAGE_HEIGHT, uploaded: true/*do not retry upload*/ }),
      ]);
    } finally {
      this.nodeView.updateView();
    }
  }
}
