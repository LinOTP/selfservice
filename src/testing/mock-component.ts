import { Component, EventEmitter, Type } from '@angular/core';

export function MockComponent(options: Component & { attributes?: { [key: string]: any } }): Type<any> {

  const metadata: Component = {
    selector: options.selector,
    template: options.template || '',
    inputs: options.inputs,
    outputs: options.outputs || [],
    exportAs: options.exportAs || ''
  };

  class Mock { }

  Object.assign(Mock.prototype, options.attributes);

  metadata.outputs.forEach(method => {
    Mock.prototype[method] = new EventEmitter<any>();
  });

  return Component(metadata)(Mock as any);
}
