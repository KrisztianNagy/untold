import {GridTile} from './models/grid-tile';
import {Interaction} from './models/interaction';
import {VisibleArea} from './models/visible-area';
import {Token} from './models/token';
import {Wall} from './models/wall';
import {TemplateConfiguration} from './models/template-configuration';
import {Untold} from '../shared/models/backend-export';

export interface AppStore {
    GridTiles: GridTile[];
    Interaction: Interaction;
    VisibleArea: VisibleArea;
    Tokens: Token[];
    SelectedToken: Token;
    CalculatedWalls: Wall[];
    UserWalls: Wall[];
    TemplateConfiguration: TemplateConfiguration;
    SelectedGame: Untold.ClientGameRealmDetails;
    RealmTables: Untold.ClientModuleTables[];
    RealmDefinitions: Untold.ClientModuleDefinitions[];
    Entities: Untold.ClientEntity[];
}
