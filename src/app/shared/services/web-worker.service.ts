import { Injectable } from '@angular/core';

@Injectable()
export class WebWorkerService {

  constructor() { }

  createCommandWorker(userJavascript: string, ...parameters: any[]): Worker {
    const commandWorkerscript = this.getCommandWorkerJavascript(userJavascript, ...parameters);
    const worker = this.getWorker(commandWorkerscript);

    return worker;
  }

  private getCommandWorkerJavascript(userJavascript: string, ...parameters: any[]): string {
    const input = JSON.stringify(parameters);

    let workerOuterJavaScript = 'onmessage = function(e) {\n'
    workerOuterJavaScript += 'var entity = e.data;\n';
    workerOuterJavaScript += 'var params = ' + input + ';\n';
    workerOuterJavaScript += 'function command() {\n';
    workerOuterJavaScript += userJavascript;
    workerOuterJavaScript += '}\n\n';
    workerOuterJavaScript += 'try {\n';
    workerOuterJavaScript += '\tvar result = command()\n';
    workerOuterJavaScript += '\tpostMessage({entity: entity, result: result});\n'
    workerOuterJavaScript += '}\n';
    workerOuterJavaScript += 'catch(err) {\n';
    workerOuterJavaScript += '\tpostMessage({error: err});\n';
    workerOuterJavaScript += '}\n';
    workerOuterJavaScript += '}\n';

    return workerOuterJavaScript;
  }

  getWorker(executable: string): Worker {
    const blob = new Blob([executable]);
    const blobUrl = window.URL.createObjectURL(blob);
    const worker = new Worker(blobUrl);

    return worker;
  }

}
