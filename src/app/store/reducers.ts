import { GridTileReducer } from './reducers/grid-tile.reducer';
import { InteractionReducer } from './reducers/interaction.reducer';
import { VisibleAreaReducer } from './reducers/visible-area.reducer';
import { TokenReducer } from './reducers/token.reducer';
import { SelectedTokenReducer } from './reducers/selected-token.reducer';
import { WallReducer } from './reducers/wall.reducer';
import { UserWallReducer } from './reducers/user-wall.reducer';
import { TemplateConfigurationReducer } from './reducers/template-configuration.reducer';
import { SelectedGameReducer } from './reducers/selected-game.reducer';
import { RealmTableReducer } from './reducers/realm-table.reducer';
import { EntityReducer } from './reducers/entity.reducer';
import { DefinitonReducer } from './reducers/definition.reducer';
import { SheetReducer } from './reducers/sheet.reducer';

export const CombinedReducers = {
    GridTiles: GridTileReducer,
    Interaction: InteractionReducer,
    VisibleArea: VisibleAreaReducer,
    Tokens: TokenReducer,
    SelectedToken: SelectedTokenReducer,
    CalculatedWalls: WallReducer,
    UserWalls: UserWallReducer,
    TemplateConfiguration: TemplateConfigurationReducer,
    SelectedGame: SelectedGameReducer,
    RealmTables: RealmTableReducer,
    RealmDefinitions: DefinitonReducer,
    Entities: EntityReducer,
    Sheets: SheetReducer
};
