import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';

/**
 * spyOnClass is used during jasmine tests to mock an injectable dependency
 * @param Class ES6 type class to mock for testing
 */
export function spyOnClass<T>(Class: T): jasmine.SpyObj<T> {
  const properties = [];

  let currentSearchClass = Class as any;
  do {
    if (currentSearchClass.prototype) {
      for (const name of Object.getOwnPropertyNames(currentSearchClass.prototype)) {
        try {
          const method = currentSearchClass.prototype[name];
          if (properties.indexOf(name) !== -1 || !(method instanceof Function) || method === currentSearchClass) {
            continue;
          }
          properties.push(name);
        } catch (e) { }
      }
    }
    currentSearchClass = Object.getPrototypeOf(currentSearchClass);
  } while (currentSearchClass);

  return jasmine.createSpyObj((Class as any).prototype.constructor.name, properties);
}

/**
 * typing wrapper to receive the injected service from the TestBed if
 * it was mocked as a jasmine spy. This is extremly helpful to receive
 * the injected service that was provided via the spyOnClass() method.
 *
 * @export
 * @template S Service type that was mocked
 * @param {Type<S>} service Service class that we want to inject
 * @returns {jasmine.SpyObj<S>} the correctly typed jasmine mock of the service
 */
export function getInjectedStub<S>(service: Type<S>): jasmine.SpyObj<S> {
  return TestBed.inject(service) as jasmine.SpyObj<S>;
}
