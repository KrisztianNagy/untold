/* tslint:disable:indent */

export declare module System {
	interface Guid {
	}
}
export declare namespace Untold {
	interface ClientDefinition {
		definitionGuid: System.Guid;
		definitions: Untold.ClientInnerDefinition[];
		moduleGuid: System.Guid;
		name: string;
		parentDefinitionGuid: System.Guid;
		rules: Untold.ClientDefinitionRule[];
	}
	interface ClientDefinitionReference {
		definitionGuid: System.Guid;
		moduleId: number;
		realmId: number;
	}
	interface ClientDefinitionRule {
		expression: string;
		target: System.Guid;
	}
	interface ClientEntity {
		definition: Untold.ClientDefinition;
		definitionGuid: System.Guid;
		entity: any;
		id: number;
		moduleGuid: System.Guid;
		name: string;
		sheetId?: number;
		users: Untold.ClientUser[];
	}
	interface ClientEntityChange {
		id: number;
		name: string;
		realmId: number;
		users: Untold.ClientUser[];
	}
	interface ClientGameRealmDetails {
		accessSignature: string;
		localMembership: Untold.ClientUserRealmMembership;
		members: Untold.ClientUserRealmMembership[];
		realm: Untold.ClientRealm;
	}
	interface ClientImage {
		fileName: string;
		filePath: string;
		fileSmallPath: string;
	}
	interface ClientImageGridResult {
		clientImages: Untold.ClientImage[];
		page: number;
		totalResults: number;
	}
	interface ClientInnerDefinition extends Untold.ClientDefinition {
		dataType: string;
		inherited: boolean;
		isCalculated: boolean;
		isList: boolean;
		occurrenceGuid: System.Guid;
	}
	interface ClientMap {
		gridJson: string;
		id: number;
		name: string;
		reamId: number;
	}
	interface ClientModuleDefinitions {
		definitions: Untold.ClientDefinition[];
		guid: System.Guid;
		id: number;
		name: string;
		realmId: number;
	}
	interface ClientModuleReference {
		moduleId: number;
		realmId: number;
	}
	interface ClientModuleTables {
		guid: System.Guid;
		id: number;
		name: string;
		tables: Untold.ClientRuleTable[];
	}
	interface ClientNotification {
		created: Date;
		data: string;
		id: number;
		isRead: boolean;
		notificationTypeId: string;
	}
	interface ClientPagedNotifications {
		currentPage: number;
		notifications: Untold.ClientNotification[];
		numberOfPages: number;
	}
	interface ClientRealm {
		created: Date;
		entityEditorAcccessSignature: string;
		entityReaderAcccessSignature: string;
		sheetEditorAcccessSignature: string;
		sheetReaderAcccessSignature: string;
		id: number;
		isCurrentUserOwner: boolean;
		members: Untold.ClientUser[];
		name: string;
		owner: Untold.ClientUser;
	}
	interface ClientRealmDefinitions {
		moduleDefinitions: Untold.ClientModuleDefinitions[];
	}
	interface ClientRealmTables {
		moduleTables: Untold.ClientModuleTables[];
	}
	interface ClientRecentNotifications {
		recentNotifications: Untold.ClientNotification[];
		unreadCount: number;
	}
	interface ClientRuleTable {
		columns: Untold.ClientRuleTableColumn[];
		editorAccessSignature: string;
		moduleGuid: System.Guid;
		name: string;
		readAccessSignature: string;
		tableGuid: System.Guid;
		uniqueTableName: string;
	}

	interface ClientSheet {
		definition: Untold.ClientDefinition;
		definitionGuid: System.Guid;
		id: number;
		moduleGuid: System.Guid;
		name: string;
	}

	interface ClientRuleTableBulkInsert {
		columns: Untold.ClientRuleTableColumn[];
		entities: Untold.ClientRuleTableBulkInsertEntity[];
		tableGuid: System.Guid;
		tableUniqueName: string;
	}
	interface ClientRuleTableBulkInsertEntity {
		partitionKey: string;
		properties: string[];
		rowKey: string;
	}
	interface ClientRuleTableColumn {
		deleted: boolean;
		id: number;
		name: string;
		order: number;
		rowKey: string;
		type: string;
	}
	interface ClientRuleTableReference {
		moduleId: number;
		realmId: number;
		uniqueTableName: string;
	}
	interface ClientToken {
		data: string;
		id: number;
		mapId: number;
		realmId: number;
	}
	interface ClientUser {
		displayName: string;
		email: string;
		id: number;
		picture: string;
		userName: string;
	}
	interface ClientUserActiveMap {
		mapId: number;
		realmId: number;
		userName: string;
	}
	interface ClientUserRealmMembership {
		activeMap: Untold.ClientMap;
		id: number;
		isOnline: boolean;
		realm: Untold.ClientRealm;
		stateId: string;
		user: Untold.ClientUser;
	}
	interface UntoldResponse {
		Data: any;
		DataList: any[];
		ExceptionMesssage: string;
		ResultCode: number;
	}
}
