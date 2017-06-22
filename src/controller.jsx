import React from 'react';
import { createController } from './createController';
import { reduxStateInjector } from './reduxStateInjector';

function getDisplayName(WrappedComponent) {
	return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export function withController(ControllerClass, options) {
	let selectors;
	let stateInjector;

	if(Array.isArray(options)) {
			selectors = options;
	}

	if(typeof(options) === 'object') {
		({ selectors, stateInjector } = options);
	}

	if(!(stateInjector)) {
		stateInjector = reduxStateInjector;
	}

	if(typeof(stateInjector) !== 'function') {
		throw new Error('Invalid type of stateInjector. It must be a function.');
	}

	const info = createController(ControllerClass, selectors);
	const { controller, selectorPropTypes, methodPropTypes, selectorMap, methodMap } = info;

	return (WrappedComponent) => {
		class Controller extends React.Component {
			componentWillMount() {
				if (controller.initialize) {
					controller.initialize();
				}
			}

			componentWillUnMount() {
				if (controller.deinitialize) {
					controller.deinitialize();
				}
			}

			getChildContext() {
				return Object.assign({ }, selectorMap, methodMap);
			}

			render() {
				return (
					<WrappedComponent {...this.props} />
				);
			}
		}

		Controller.displayName = `Controller(${getDisplayName(WrappedComponent)})`;
		Controller.propTypes = Object.assign({}, selectorPropTypes, (WrappedComponent.propTypes || {}));
		Controller.childContextTypes = Object.assign({ }, selectorPropTypes, methodPropTypes);

		return stateInjector(Controller, info);
	}
}