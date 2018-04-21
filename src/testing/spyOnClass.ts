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
