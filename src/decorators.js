import 'reflect-metadata';
import PropTypes from 'prop-types';
import { withController } from './controller';

export const propertyTypeMetaKey = Symbol('property:type');
export const propertySelectorMetaKey = Symbol('property:selector');

/**
 * attach meta information to class about property
 * @param metaKey
 * @param target
 * @param propertyKey
 * @param propertyInfo
 */
function attachMetaInfo(metaKey, target, propertyKey, propertyInfo) {
	const metaInfo = Reflect.getOwnMetadata(metaKey, target) || {};
	metaInfo[propertyKey] = propertyInfo || true;

	Reflect.defineMetadata(metaKey, metaInfo, target);
}

/**
 * helper to validate propertyType
 * @param metaKey
 * @param target
 * @param propertyKey
 * @param propType
 */
function attachPropType(metaKey, target, propertyKey, propType) {
	if(propType) {
		if(typeof(propType) !== 'function') {
			throw new Error(`Invalid propType (${propType}) for property ${propertyKey}.`);
		}

		attachMetaInfo(metaKey, target, propertyKey, propType);
	}
}

/**
 * test if object is a descriptor of property
 * @param obj
 * @returns {boolean}
 */
function isPropertyDescriptor(obj) {
	const descriptorProps = ['value', 'initializer', 'get', 'set'];
	return (typeof(obj) === 'object' && Object.getOwnPropertyNames(obj).some(k => descriptorProps.indexOf(k) !== -1));
}

/**
 * factory to create a property decorator with/without bracers
 * @param decorator
 * @returns {Function}
 */
function makePropertyDecorator(decorator) {
	return function (target, propertyKey, descriptor) {
		if (arguments.length === 3 && typeof(propertyKey) === 'string' && isPropertyDescriptor(descriptor)) {
			const options = [];
			return decorator(target, propertyKey, descriptor, options);
		} else {
			const options = arguments;
			return (target, propertyKey, descriptor) => decorator(target, propertyKey, descriptor, options);
		}
	}
}

/**
 * @observable decorator, mark property as 'observable value', i.e. return slice of state as result
 * @type {Function}
 */
export const observable = makePropertyDecorator((target, propertyKey, descriptor, [propType]) => {
	if((descriptor.value) && (typeof(descriptor.value) === 'function') || descriptor.get || descriptor.set) {
		throw new Error(`Observable '${propertyKey}' must be declared as property without getters or setters.`);
	}

	const defaultValue = (descriptor.initializer && typeof(descriptor.initializer) === 'function')
		? descriptor.initializer
		: () => undefined;

	const get = function() {
		return this.state.hasOwnProperty(propertyKey) ? this.state[propertyKey] : defaultValue();
	};

	attachPropType(propertyTypeMetaKey, target, propertyKey, propType);
	return {
		get,
	};
});

/**
 * @computed decorator, mark property as 'computed value', i.e. return computed value as result
 * @type {Function}
 */
export const computed = makePropertyDecorator((target, propertyKey, descriptor, [propType]) => {
	if(!descriptor.get) {
		throw new Error(`Computed property '${propertyKey}' must be declared as getter.`);
	}

	if(descriptor.set || descriptor.writable || descriptor.hasOwnProperty('value')) {
		throw new Error(`Computed property '${propertyKey}' can not have setter or value.`);
	}

	attachPropType(propertyTypeMetaKey, target, propertyKey, propType);
	return descriptor;
});

/**
 * @selector decorator, mark property as 'computed selector', i.e. return function as result. E.g., can be used with 'reselect'.
 * @type {Function}
 */
export const selector = makePropertyDecorator((target, propertyKey, descriptor, [propType]) => {
	/**
	 * check if 'propType' is PropTypes or selector called directly to convert observable/computed property into selector function
	 * E.g.: selector(this.computedValue) or selector(this.observableValue)
	 */
	if(typeof(propType) !== 'function' && typeof(propType) !== 'undefined') {
		return propType;
	}

	const computedDescriptor = computed(propType)(target, propertyKey, descriptor);
	attachMetaInfo(propertySelectorMetaKey, target, propertyKey);

	return computedDescriptor;
});

/**
 * @expose decorator, retain type of property to expose it lately
 * @type {Function}
 */
export const expose = makePropertyDecorator((target, propertyKey, descriptor, [propType]) => {
	if((descriptor.value && typeof(descriptor.value) !== 'function') || descriptor.set) {
		throw new Error(`'${propertyKey}' must be declared as getter, property or method. `);
	}

	if(!propType) {
		propType = (descriptor.value && typeof(descriptor.value) === 'function')
			? PropTypes.func.isRequired
			: PropTypes.any.isRequired;
	}

	attachPropType(propertyTypeMetaKey, target, propertyKey, propType);

	return descriptor;
});

/**
 * @controller decorator
 * @param ViewClass
 */
export const controller = (ViewClass) => (ControllerClass) => withController(ControllerClass)(ViewClass);