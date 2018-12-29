import React from "react";
import { Mutation } from "react-apollo";
import { RouteComponentProps } from "react-router";
import { toast } from "react-toastify";
import { LOG_USER_IN } from "src/sharedQueries.local";
import { verifyPhone, verifyPhoneVariables } from "src/types/api";
import VerifyPhonePresenter from "./VerifyPhonePresenter";
import { VERIFY_PHONE } from "./VerifyPhoneQueries";

interface IState {
  verificationKey: string;
  phoneNumber: string;
}

interface IProps extends RouteComponentProps<any> {}

class VerifyMutation extends Mutation<verifyPhone, verifyPhoneVariables> {}

class VerifyPhoneContainer extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    if (!props.location.state || props.location.state.phone === undefined) {
      props.history.push("/");
    }

    this.state = {
      phoneNumber: props.location.state.phone,
      verificationKey: ""
    };
  }
  public render() {
    const { verificationKey, phoneNumber } = this.state;
    return (
      <Mutation mutation={LOG_USER_IN}>
        {logUserIn => (
          <VerifyMutation
            mutation={VERIFY_PHONE}
            variables={{ key: verificationKey, phoneNumber }}
            onCompleted={data => {
              const { CompletePhoneVerification } = data;
              if (CompletePhoneVerification.ok) {
                logUserIn({
                  variables: {
                    token: CompletePhoneVerification.token
                  }
                });
                toast.success("You're virified, loggin in now.");
              } else {
                // tslint:disable-next-line
                console.log(CompletePhoneVerification);
                toast.error(CompletePhoneVerification.error);
              }
            }}
          >
            {(mutation, { loading }) => {
              return (
                <VerifyPhonePresenter
                  onSubmit={mutation}
                  onChange={this.onInputChage}
                  verificationKey={verificationKey}
                  loading={loading}
                />
              );
            }}
          </VerifyMutation>
        )}
      </Mutation>
    );
  }

  public onInputChage: React.ChangeEventHandler<HTMLInputElement> = event => {
    const {
      target: { name, value }
    } = event;

    this.setState({
      [name]: value
    } as any);
  };
}

export default VerifyPhoneContainer;
