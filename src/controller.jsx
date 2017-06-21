import React from 'react';
import { connect } from 'react-redux';
import { createController } from './createController';

function getDisplayName(WrappedComponent) {
	return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export function withController(ControllerClass, selectors) {
	const { controller, selectorPropTypes, methodPropTypes, selectorMap, methodMap } = createController(ControllerClass, selectors);

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
				// Pass only required of selector/controller props to context for descendant components
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

		// Declare the availability of all of the selectors and controller methods in the React context for descendant components.
		Controller.childContextTypes = Object.assign({ }, selectorPropTypes, methodPropTypes);

		const mapStateToProps = (state, props) => {
			Object.assign(controller, { state, props });
			return selectorMap;
		};

		return connect(mapStateToProps)(Controller);
	}
}