/**
 * inject state into Controller component
 * @param Controller
 * @param info
 */
export function reduxStateInjector(Controller, info) {
	const { connect } = require('react-redux');

	const mapStateToProps = (state, props) => {
		Object.assign(info.controller, { state, props });
		return Object.assign({ }, info.selectorMap);
	};

	return connect(mapStateToProps)(Controller);
}