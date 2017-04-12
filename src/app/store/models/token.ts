import {Untold} from '../../shared/models/backend-export';

export class Token {
    id: number;
    row: number;
    column: number;
    x: number;
    y: number;
    image: Untold.ClientImage;
    fitToGrid: boolean;
    beingDragged: boolean;
    width: number;
    height: number;
    layer: number;
    loadedImage: any;
    owner: Untold.ClientUser;
}
