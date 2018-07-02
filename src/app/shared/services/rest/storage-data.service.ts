import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AzureTableRow } from '../../models/data-table';

@Injectable()
export class StorageDataService {
  private readonly storageUrl = 'https://untoldtable.table.core.windows.net/';

  constructor(private http: Http) {

  }

  insertOrUpdate(data: AzureTableRow, tableName: string, editorSignature: string): Observable<Response> {
    const headers = new Headers({
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    });

    const options = new RequestOptions({
      headers: headers
    });

    const path = this.storageUrl + tableName +
      '(PartitionKey=\'' + data.PartitionKey + '\',RowKey=\'' + data.RowKey + '\')' + editorSignature;
    return this.http.put(path, data, options);
  }

  readColumns(tableName: string, readerSignature: string): Observable<string> {
    const headers = new Headers({
      'Accept': 'application/json;odata=nometadata'
    });

    const options = new RequestOptions({
      headers: headers
    });

    const path = this.storageUrl + tableName + readerSignature + '&$filter=PartitionKey%20eq%20\'column\'%20';
    const observable = this.http.get(path, options)
      .pipe(map(res => res.text()));

    return observable;
  }

  readRow(tableName: string, partitionKey: string, rowKey: string, readerSignature: string): Observable<string> {
    const headers = new Headers({
      'Accept': 'application/json;odata=nometadata'
    });

    const options = new RequestOptions({
      headers: headers
    });

    const path = this.storageUrl + tableName +
      '(PartitionKey=\'' + partitionKey + '\',RowKey=\'' + rowKey + '\')' + readerSignature;
    const observable = this.http.get(path, options)
      .pipe(map(res => res.text()));

    return observable;
  }

  readRows(tableName: string, readerSignature: string): Observable<string> {
    const headers = new Headers({
      'Accept': 'application/json;odata=nometadata'
    });

    const options = new RequestOptions({
      headers: headers
    });

    const path = this.storageUrl + tableName + readerSignature + '&$filter=PartitionKey%20eq%20\'row\'%20';
    const observable = this.http.get(path, options)
      .pipe(map(res => res.text()));

    return observable;
  }

  readFilteredRows(tableName: string, readerSignature: string, filter: string): Observable<string> {
    const headers = new Headers({
      'Accept': 'application/json;odata=nometadata'
    });

    const options = new RequestOptions({
      headers: headers
    });

    const path = this.storageUrl + tableName + readerSignature + '&$filter=' + filter;
    const observable = this.http.get(path, options)
      .pipe(map(res => res.text()));

    return observable;
  }



  delete(data: AzureTableRow, tableName: string, editorSignature: string): Observable<Response> {
    const headers = new Headers({
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'If-Match': '*'
    });

    const options = new RequestOptions({
      headers: headers
    });

    const path = this.storageUrl + tableName +
      '(PartitionKey=\'' + data.PartitionKey + '\',RowKey=\'' + data.RowKey + '\')' + editorSignature;
    return this.http.delete(path, options);
  }

}
