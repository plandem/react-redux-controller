/**
 * inject state into Controller component
 * @param Controller
 * @param info
 */
export function reduxStateInjector(Controller, info) {
	const { connect } = require('react-redux');

	const mapStateToProps = (state) => {
		info.controller.state = state;
		return info.selectorMap;
		// return Object.assign({ }, info.selectorMap);
	};

	return connect(mapStateToProps)(Controller);
}