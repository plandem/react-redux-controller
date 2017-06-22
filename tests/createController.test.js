import PropTypes from 'prop-types';
import { createSelector }  from 'reselect';
import { createController } from '../src/createController';
import { expose, observable, computed, selector } from '../src/decorators';

describe('createController', () => {
	it('instantiate works as expected', () => {
		expect(() => { createController(
			class UserController {
				@selector get blockedUsers() {}
			}, ['blockedUsers']) }).toThrowError();

		expect(() => { createController(
			class UserController {
				@observable(PropTypes.number) selectedUser;

				static propTypes = {
					selectedUser: PropTypes.number
				}
			}) }).toThrowError();

		expect(() => { createController(
			class UserController {
				@observable selectedUser;
			}) }).not.toThrowError();

		expect(() => { createController(
			class UserController {
				@observable(PropTypes.number) selectedUser;
			}) }).not.toThrowError();
	});

	it('instantiate returns valid information', () => {
		class UserController {
			@observable(PropTypes.array) users = [];
			@observable(PropTypes.number) selectedUser = null;
			@computed(PropTypes.object) get currentUser() {}
			@selector(PropTypes.array) get blockedUsers() {}

			@expose onFetch() {}
		}

		//controller, selectorPropTypes, methodPropTypes, selectorMap, methodMap
		const info = createController(UserController);

		expect(info.controller).toBeInstanceOf(UserController);
		expect(Object.keys(info.selectorPropTypes).sort()).toEqual(['users', 'selectedUser', 'currentUser', 'blockedUsers'].sort());
		expect(Object.keys(info.methodPropTypes)).toEqual(['onFetch']);

		expect(Object.keys(info.selectorMap).sort()).toEqual(['users', 'selectedUser', 'currentUser', 'blockedUsers'].sort());
		expect(Object.keys(info.methodMap)).toEqual(['onFetch']);

		expect(Object.getOwnPropertyDescriptor(info.selectorMap, 'users')).toEqual(expect.objectContaining({ enumerable: true, get: expect.any(Function) }));
		expect(Object.getOwnPropertyDescriptor(info.selectorMap, 'selectedUser')).toEqual(expect.objectContaining({ enumerable: true, get: expect.any(Function) }));
		expect(Object.getOwnPropertyDescriptor(info.selectorMap, 'currentUser')).toEqual(expect.objectContaining({ enumerable: true, get: expect.any(Function) }));
		expect(Object.getOwnPropertyDescriptor(info.selectorMap, 'blockedUsers')).toEqual(expect.objectContaining({ enumerable: true, get: expect.any(Function) }));

		expect(Object.getOwnPropertyDescriptor(info.methodMap, 'onFetch')).toEqual(expect.objectContaining({ enumerable: true, value: expect.any(Function) }));
	});

	describe('controller works correctly with state and props', () => {
		let info;

		beforeEach(() => {
			class UserController {
				@observable(PropTypes.array) users = [];
				@observable(PropTypes.number) selectedUser = null;

				@computed(PropTypes.object) get currentUser() {
					return (this.selectedUser !== null) ? this.users[this.selectedUser] : null;
				}

				@selector(PropTypes.array) get blockedUsers() {
					return createSelector(
						selector(this.users),
						(users) => (users.filter(user => user.blocked))
					);
				}

				@selector(PropTypes.bool) get isCurrentUserBlocked() {
					return createSelector(
						selector(this.currentUser),
						this.blockedUsers,
						(currentUser, blockedUsers) => (blockedUsers.reduce((result, nextUser) => (nextUser.name === currentUser.name ? nextUser : result), false))
					);
				}

				@expose onClick() {
					return 'sync result';
				}

				@expose async onFetch() {
					return Promise.resolve('async result');
				}
			}

			info = createController(UserController);
		});

		it('by default there is "state" and "props"', () => {
			expect(info.controller.state).toBeUndefined();
			expect(info.controller.props).toBeUndefined();
		});

		it('properties do not work without state', () => {
			expect(() => info.controller.users).toThrowError();
			expect(() => info.controller.selectedUser).toThrowError();
			expect(() => info.controller.currentUser).toThrowError();
			expect(() => info.controller.blockedUsers).toThrowError();
			expect(() => info.controller.isCurrentUserBlocked).toThrowError();

			expect(() => info.selectorMap.users).toThrowError();
			expect(() => info.selectorMap.selectedUser).toThrowError();
			expect(() => info.selectorMap.currentUser).toThrowError();
			expect(() => info.selectorMap.blockedUsers).toThrowError();
			expect(() => info.selectorMap.isCurrentUserBlocked).toThrowError();
		});

		it('methods work without state', () => {
			expect(() => info.controller.onClick()).not.toThrowError();
			expect(() => info.controller.onFetch()).not.toThrowError();

			expect(() => info.methodMap.onClick()).not.toThrowError();
			expect(() => info.methodMap.onFetch()).not.toThrowError();
		});

		it('@observable properties return default values for empty state', () => {
			Object.assign(info.controller, { state: {}});

			expect(info.controller.users).toEqual([]);
			expect(info.controller.selectedUser).toBeNull();

			expect(info.selectorMap.users).toEqual([]);
			expect(info.selectorMap.selectedUser).toBeNull();
		});

		it('@observable properties return slices of state', () => {
			const users = [ { name: 'user 0', blocked: false }, { name: 'user 1', blocked: true }];

			Object.assign(info.controller, { state: {
				users,
				selectedUser: 0,
			}});

			expect(info.controller.users).toEqual(users);
			expect(info.controller.selectedUser).toEqual(0);
			expect(info.selectorMap.users).toEqual(users);
			expect(info.selectorMap.selectedUser).toEqual(0);
		});

		it('@computed properties works as expected', () => {
			const users = [ { name: 'user 0', blocked: false }, { name: 'user 1', blocked: true }];

			Object.assign(info.controller, { state: {
				users,
				selectedUser: 0,
			}});

			expect(info.controller.currentUser).toEqual(users[0]);
			expect(info.selectorMap.currentUser).toEqual(users[0]);

			info.controller.state.selectedUser = 1;
			expect(info.controller.currentUser).toEqual(users[1]);
			expect(info.selectorMap.currentUser).toEqual(users[1]);
		});

		it('@selector properties works as expected', () => {
			const users = [ { name: 'user 0', blocked: false }, { name: 'user 1', blocked: true }];

			Object.assign(info.controller, { state: {
				users,
				selectedUser: 0,
			}});

			expect(info.controller.blockedUsers).toEqual(expect.any(Function));
			expect(info.selectorMap.blockedUsers).toEqual([users[1]]);

			expect(info.controller.isCurrentUserBlocked).toEqual(expect.any(Function));
			expect(info.selectorMap.isCurrentUserBlocked).toBeFalsy();

			info.controller.state.selectedUser = 1;
			expect(info.controller.isCurrentUserBlocked).toEqual(expect.any(Function));
			expect(info.selectorMap.isCurrentUserBlocked).toBeTruthy();
		});
	});
});