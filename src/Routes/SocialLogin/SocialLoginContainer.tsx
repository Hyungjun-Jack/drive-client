import React from "react";
import { Mutation, MutationFn } from "react-apollo";
import { RouteComponentProps } from "react-router";
import { toast } from "react-toastify";
import { LOG_USER_IN } from "src/sharedQueries.local";
import { facebookConnect, facebookConnectVariables } from "src/types/api";
import SocialLoginPresenter from "./SocialLoginPresenter";
import { FACEBOOK_CONNECT } from "./SocialLoginQueries";

class LoginMutation extends Mutation<
  facebookConnect,
  facebookConnectVariables
> {}

interface IState {
  firstName: string;
  lastName: string;
  email?: string;
  fbId: string;
}

interface IProps extends RouteComponentProps<any> {}

class SocialLoginContainer extends React.Component<IProps, IState> {
  public facebookMutation: MutationFn;
  public render() {
    return (
      <Mutation mutation={LOG_USER_IN}>
        {logUserIn => (
          <LoginMutation
            mutation={FACEBOOK_CONNECT}
            onCompleted={data => {
              const { FacebookConnect } = data;
              console.log(FacebookConnect);
              if (FacebookConnect.ok) {
                logUserIn({
                  variables: {
                    token: FacebookConnect.token
                  }
                });
              } else {
                toast.error(FacebookConnect.error);
              }
            }}
          >
            {(mutation, { loading }) => {
              this.facebookMutation = mutation;
              return (
                <SocialLoginPresenter loginCallback={this.loginCallback} />
              );
            }}
          </LoginMutation>
        )}
      </Mutation>
    );
  }

  public loginCallback = response => {
    const { name, first_name, last_name, email, id, accessToken, error } = response;
    console.log(response);
    if(error){
      toast.error(error.message);
    } else { 
      if (accessToken) {
        toast.success(`Welcom ${name}`);
        this.facebookMutation({
          variables: {
            email,
            fbId: id,
            firstName: first_name,
            lastName: last_name
          }
        });
      } else {
        toast.error("Could not log you in 😔");
      }
    }
  };
}

export default SocialLoginContainer;
