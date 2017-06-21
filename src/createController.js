import { propertyTypeMetaKey, propertySelectorMetaKey } from './decorators';

/**
 * return all properties of object, including inherited
 * @param obj
 * @returns {{}}
 */
export function getAllProperties(obj) {
	const props = {};

	do {
		const names = Object.getOwnPropertyNames(obj);
		names.forEach(name => {
			if(name !== 'constructor') {
				props[name] = Object.getOwnPropertyDescriptor(obj, name);
			}
		});

		obj = Object.getPrototypeOf(obj);
	} while(obj !== Object.prototype);

	return props;
}

/**
 * instantiate controller and return required objects for further usage
 * @param ControllerClass
 * @param selectors
 * @returns {{controller: *, selectorPropTypes, methodPropTypes, selectorMap, methodMap}}
 */
export function createController(ControllerClass, selectors) {
	const controller = new ControllerClass();

	let selectorPropNames;

	//get information about properties that must be considered as selectors, i.e. converted into (state) => selectorFn(state)
	if(Reflect.hasMetadata(propertySelectorMetaKey, controller)) {
		if(Array.isArray(selectors)) {
			throw new Error('You can\'t provide information about selectors via parameter and decorators at the same time.');
		}

		selectorPropNames = Reflect.getMetadata(propertySelectorMetaKey, controller);
	} else {
		selectorPropNames = {};
		(selectors || []).forEach(propName => (selectorPropNames[propName] = true));
	}

	//get information about properties/methods that must be exposed to Controller component as child context
	const metaPropTypes = Reflect.getMetadata(propertyTypeMetaKey, controller) || {};
	const protoPropTypes = ControllerClass.propTypes || {};

	const duplicates = Object.keys(metaPropTypes).filter(propName => protoPropTypes.hasOwnProperty(propName));
	if(duplicates.length) {
		throw new Error(`There is a duplicate propType information for next props: ${duplicates}.`);
	}

	const propTypes = Object.assign({}, metaPropTypes, protoPropTypes);
	if(!(Object.keys(propTypes).length)) {
		throw new Error('There is no any information about propTypes.');
	}

	const methodMap = {};
	const methodPropTypes = {};

	const selectorMap = {};
	const selectorPropTypes = {};

	const props = getAllProperties(controller);
	Object.keys(props).forEach(propName => {
		//ignore any non exposed property
		if(!(propTypes.hasOwnProperty(propName))) {
			return;
		}

		if(typeof(props[propName].value) === 'function') {
			//property is a method
			methodPropTypes[propName] = propTypes[propName];
			Object.defineProperty(methodMap, propName, {
				enumerable: true,
				writable: false,
				configurable: false,
				value: props[propName].value.bind(controller),
			});

			return;
		}

		selectorPropTypes[propName] = propTypes[propName];
		if(selectorPropNames[propName]) {
			//property is a true selector, i.e. result is a function
			Object.defineProperty(selectorMap, propName, {
				enumerable: true,
				configurable: false,
				get: () => props[propName].get.bind(controller)()(controller.state),
			});
		} else {
			//property is a getter, i.e. result is a value
			Object.defineProperty(selectorMap, propName, {
				enumerable: true,
				configurable: false,
				get: props[propName].get.bind(controller),
			});
		}
	});

	//attach 'props' property to controller for 'mapStateToProps'
	Object.defineProperty(controller, 'props', {
		writable: true,
		enumerable: false,
	});

	//attach 'state' property to controller for 'mapStateToProps'
	Object.defineProperty(controller, 'state', {
		writable: true,
		enumerable: false,
	});

	return { controller, selectorPropTypes, methodPropTypes, selectorMap, methodMap };
}