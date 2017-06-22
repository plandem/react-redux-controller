### Usage with decorators
```js
import PropTypes from 'prop-types';
import { createSelector } from 'reselect';
import { expose, observable, computed, selector, controller } from 'react-redux-controller';
import UserView from './components/user';

@controller(UserView)
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
        const { dispatch } = this.props;
        return dispatch({ type: 'click' });
    }

    @expose async onFetch() {
        return Promise.resolve('async result');
    }
}

export default UserController;

```

or

```js
import PropTypes from 'prop-types';
import { createSelector } from 'reselect';
import { expose, observable, computed, selector, controller } from 'react-redux-controller';
import UserView from './components/user';

@controller(UserView)
class UserController {
    @observable users = [];
    @observable selectedUser = null;

    @computed get currentUser() {
        return (this.selectedUser !== null) ? this.users[this.selectedUser] : null;
    }

    @selector get blockedUsers() {
        return createSelector(
            selector(this.users),
            (users) => (users.filter(user => user.blocked))
        );
    }

    @selector get isCurrentUserBlocked() {
        return createSelector(
            selector(this.currentUser),
            this.blockedUsers,
            (currentUser, blockedUsers) => (blockedUsers.reduce((result, nextUser) => (nextUser.name === currentUser.name ? nextUser : result), false))
        );
    }

    @expose onClick() {
        const { dispatch } = this.props;
        return dispatch({ type: 'click' });
    }

    @expose async onFetch() {
        return Promise.resolve('async result');
    }
}

UserController.propTypes = {
    users: PropTypes.array,
    selectedUser: PropTypes.number,
    currentUser: PropTypes.object,
    blockedUsers: PropTypes.array
    isCurrentUserBlocked: PropTypes.bool,
}

export default UserController;
```

or

```js
import PropTypes from 'prop-types';
import { createSelector } from 'reselect';
import { expose, observable, computed, selector, controller } from 'react-redux-controller';
import UserView from './components/user';

@controller(UserView)
class UserController {
    @observable @expose users = [];
    @observable @expose selectedUser = null;

    @computed @expose get currentUser() {
        return (this.selectedUser !== null) ? this.users[this.selectedUser] : null;
    }

    @selector @expose get blockedUsers() {
        return createSelector(
            selector(this.users),
            (users) => (users.filter(user => user.blocked))
        );
    }

    @selector @expose get isCurrentUserBlocked() {
        return createSelector(
            selector(this.currentUser),
            this.blockedUsers,
            (currentUser, blockedUsers) => (blockedUsers.reduce((result, nextUser) => (nextUser.name === currentUser.name ? nextUser : result), false))
        );
    }

    @expose onClick() {
        const { dispatch } = this.props;
        return dispatch({ type: 'click' });
    }

    @expose async onFetch() {
        return Promise.resolve('async result');
    }
}

export default UserController;
```

### Usage without decorators
```js
import PropTypes from 'prop-types';
import { createSelector } from 'reselect';
import { selector, withController } from 'react-redux-controller';
import UserView from './components/user';

class UserController {
    get users() { return this.state.users || [] };
    get selectedUser() { return this.state.hasOwnProperty('selectedUser') ? this.state.selectedUser : null };

    get currentUser() {
        return (this.selectedUser !== null) ? this.users[this.selectedUser] : null;
    }

    get blockedUsers() {
        return createSelector(
            selector(this.users),
            (users) => (users.filter(user => user.blocked))
        );
    }

    get isCurrentUserBlocked() {
        return createSelector(
            selector(this.currentUser),
            this.blockedUsers,
            (currentUser, blockedUsers) => (blockedUsers.reduce((result, nextUser) => (nextUser.name === currentUser.name ? nextUser : result), false))
        );
    }

    onClick() {
        const { dispatch } = this.props;
        return dispatch({ type: 'click' });
    }

    async onFetch() {
        return Promise.resolve('async result');
    }
}

UserController.propTypes = {
    users: PropTypes.array,
    selectedUser: PropTypes.number,
    currentUser: PropTypes.object,
    blockedUsers: PropTypes.array
    isCurrentUserBlocked: PropTypes.bool,
    onClick: PropTypes.func,
    onFetch: PropTypes.func,
}

export default withController(UserController, ['blockedUsers', 'isCurrentUserBlocked'])(UserView);
```

