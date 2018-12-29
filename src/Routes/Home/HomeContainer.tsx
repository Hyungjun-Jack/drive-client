import React from "react";
import { Mutation, Query } from "react-apollo";
import { RouteComponentProps } from "react-router";
import { USER_PROFILE } from "src/sharedQueries";
import { LOG_USER_OUT } from "src/sharedQueries.local";
import { userProfile } from "../../types/api";
import HomePresenter from "./HomePresenter";

interface IState {
  isMenuOpen: boolean;
}
interface IProps extends RouteComponentProps<any> {}

class ProfileQuery extends Query<userProfile> {}

class HomeContainer extends React.Component<IProps, IState> {
  public state = {
    isMenuOpen: false
  };
  public render() {
    const { isMenuOpen } = this.state;
    return (
      <Mutation mutation={LOG_USER_OUT}>
        {logUserOut => (
          <ProfileQuery query={USER_PROFILE}>
            {({ data, loading, error }) => {
              if (error) {
                return null;
              }
              return (
                <HomePresenter
                  loading={loading}
                  isMenuOpen={isMenuOpen}
                  toggleMenu={this.toggleMenu}
                />
              );
            }}
          </ProfileQuery>
        )}
      </Mutation>
    );
  }

  public toggleMenu = () => {
    this.setState(state => {
      return {
        isMenuOpen: !state.isMenuOpen
      };
    });
  };
}

export default HomeContainer;
