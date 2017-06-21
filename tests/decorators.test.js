import PropTypes from 'prop-types';
import { expose, observable, computed, selector, propertyTypeMetaKey, propertySelectorMetaKey } from '../src/decorators';

describe('Decorators', () => {
	it('@computed can be used for getters only', () => {
		expect(() => { class UserController {
			@computed currentUser
		}}).toThrowError();

		expect(() => { class UserController {
			@computed currentUser() {}
		}}).toThrowError();

		expect(() => { class UserController {
			@computed set currentUser(a) {}
		}}).toThrowError();

		expect(() => { class UserController {
			@computed get currentUser() {}
		}}).not.toThrowError();
	});

	it('@selector can be used for getters only', () => {
		expect(() => { class UserController {
			@selector blockedUsers
		}}).toThrowError();

		expect(() => { class UserController {
			@selector blockedUsers() {}
		}}).toThrowError();

		expect(() => { class UserController {
			@computed set currentUser(a) {}
		}}).toThrowError();

		expect(() => { class UserController {
			@selector get blockedUsers() {}
		}}).not.toThrowError();
	});

	it('@observable can be used for properties only', () => {
		expect(() => { class UserController {
			@observable selectedUser() {}
		}}).toThrowError();

		expect(() => { class UserController {
			@observable get selectedUser() {}
		}}).toThrowError();

		expect(() => { class UserController {
			@observable set selectedUser(a) {}
		}}).toThrowError();

		expect(() => { class UserController {
			@observable selectedUser
		}}).not.toThrowError();
	});

	it('@observable without default value', () => {
		class UserController {
			@observable selectedUser;
		}

		const userController = new UserController();
		expect(() => (userController.selectedUser)).toThrowError();

		userController.state = {};
		expect(userController.selectedUser).toEqual(undefined);

		userController.state = { selectedUser: -1 };
		expect(userController.selectedUser).toEqual(-1);
	});

	it('@observable with default value', () => {
		class UserController {
			@observable selectedUser = 12345;
		}

		const userController = new UserController();
		expect(() => (userController.selectedUser)).toThrowError();

		userController.state = {};
		expect(() => (userController.selectedUser)).not.toThrowError();
		expect(userController.selectedUser).toEqual(12345);

		userController.state = { selectedUser: -1 };
		expect(userController.selectedUser).toEqual(-1);
	});

	it('@expose can be used without type only for methods', () => {
		expect(() => { class UserController {
			@expose selectedUser;
		}}).toThrowError();

		expect(() => { class UserController {
			@expose() selectedUser;
		}}).toThrowError();

		expect(() => { class UserController {
			@expose get currentUser() {}
		}}).toThrowError();

		expect(() => { class UserController {
			@expose set currentUser(a) {}
		}}).toThrowError();

		expect(() => { class UserController {
			@expose(PropTypes.number) set currentUser(a) {}
		}}).toThrowError();

		expect(() => { class UserController {
			@expose(PropTypes.number) selectedUser;
		}}).not.toThrowError();

		expect(() => { class UserController {
			@expose(PropTypes.number) get currentUser() {}
		}}).not.toThrowError();

		expect(() => { class UserController {
			@expose() onFetch() {}
		}}).not.toThrowError();

		expect(() => { class UserController {
			@expose onFetch() {}
		}}).not.toThrowError();
	});

	it('controller has metadata for selectors', () => {
		class UserController {
			@observable users;
			@observable selectedUser;
			@computed get currentUser() {}
			@selector get blockedUsers() {}
		}

		const userController = new UserController();
		const meta = Reflect.getMetadata(propertySelectorMetaKey, userController);
		expect(Object.keys(meta)).toEqual([ 'blockedUsers' ]);
	});

	it('controller has metadata for propTypes without @expose', () => {
		class UserController {
			@observable(PropTypes.array.isRequired) users;
			@observable(PropTypes.number.isRequired) selectedUser;
			@computed(PropTypes.object.isRequired) get currentUser() {}
			@selector(PropTypes.array.isRequired) get blockedUsers() {}
		}

		const userController = new UserController();
		const meta = Reflect.getMetadata(propertyTypeMetaKey, userController);
		expect(Object.keys(meta)).toEqual(['users', 'selectedUser', 'currentUser', 'blockedUsers']);
	});

	it('controller has metadata for propTypes with @expose', () => {
		class UserController {
			@observable @expose(PropTypes.array.isRequired) users;
			@observable @expose(PropTypes.number.isRequired) selectedUser;
			@computed @expose(PropTypes.object.isRequired) get currentUser() {}
			@selector @expose(PropTypes.array.isRequired) get blockedUsers() {}
			@expose onFetch() {}
		}

		const userController = new UserController();
		const meta = Reflect.getMetadata(propertyTypeMetaKey, userController);
		expect(Object.keys(meta)).toEqual(['users', 'selectedUser', 'currentUser', 'blockedUsers', 'onFetch']);
	});
});