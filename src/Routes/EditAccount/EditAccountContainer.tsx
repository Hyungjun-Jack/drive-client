import axios from "axios";
import React from "react";
import { Mutation, Query } from "react-apollo";
// import { RouteComponentProps } from "react-router-dom";
import { toast } from "react-toastify";
import { USER_PROFILE } from "src/sharedQueries";
import { userProfile } from "../../types/api";
import { updateProfile, updateProfileVariables } from "../../types/api";
import EditAccountPresenter from "./EditAccountPresenter";
import { UPDATE_PROFILE } from "./EditAccountQueries";

interface IState {
  firstName: string;
  lastName: string;
  email: string;
  profilePhoto: string;
  uploading: boolean;
}

// interface IProps extends RouteComponentProps<any> {}

// interface IEditAccountProps extends RouteComponentProps<any> {
interface IEditAccountProps {
  data: userProfile;
}
class UpdateProfileMutation extends Mutation<
  updateProfile,
  updateProfileVariables
> {}

class ProfileQuery extends Query<userProfile> {}

class EditAccountContainer extends React.Component {
  public render() {
    return (
      <ProfileQuery query={USER_PROFILE} fetchPolicy={"cache-and-network"}>
        {({ data, loading, error }) => {
          if (loading) {
            return null;
          }
          if (error) {
            console.log(error);
            return null;
          }

          if (!data) {
            return null;
          }
          return <Container data={data} />;
        }}
      </ProfileQuery>
    );
  }
}

class Container extends React.Component<IEditAccountProps, IState> {
  public state = {
    email: "",
    firstName: "",
    lastName: "",
    profilePhoto: "",
    uploading: false
  };

  constructor(props) {
    super(props);
    this.state = props.data.GetMyProfile.user;
  }
  public render() {
    const { email, firstName, lastName, profilePhoto, uploading } = this.state;
    console.log(this.state);
    return (
      <UpdateProfileMutation
        mutation={UPDATE_PROFILE}
        variables={{
          email,
          firstName,
          lastName,
          profilePhoto
        }}
        refetchQueries={[{ query: USER_PROFILE }]}
        onCompleted={mutationData => {
          const { UpdateMyProfile } = mutationData;
          if (UpdateMyProfile) {
            if (UpdateMyProfile.ok) {
              toast.success("Profile updated!");
            } else {
              toast.error(UpdateMyProfile.error);
            }
          }
        }}
      >
        {(updateProfileFn, { loading: loadingMutation }) => (
          <EditAccountPresenter
            email={email}
            firstName={firstName}
            lastName={lastName}
            profilePhoto={profilePhoto}
            onInputChange={this.onInputChange}
            loading={loadingMutation}
            onSubmit={updateProfileFn}
            uploading={uploading}
          />
        )}
      </UpdateProfileMutation>
    );
  }
  public onInputChange: React.ChangeEventHandler<
    HTMLInputElement
  > = async event => {
    const {
      target: { name, value, files }
    } = event;
    console.log(name, value);
    if (files && files.length > 0) {
      this.setState({
        uploading: true
      });

      const formData = new FormData();
      formData.append("file", files[0]);
      formData.append("api_key", "411956347193156");
      formData.append("upload_preset", "bmy0kr2k");
      formData.append("timestamp", String(Date.now() / 1000));
      const {
        data: { secure_url }
      } = await axios.post(
        "https://api.cloudinary.com/v1_1/deheldgne/image/upload",
        formData
      );
      if (secure_url) {
        console.log("c");
        console.log(secure_url);
        this.setState({
          profilePhoto: secure_url,
          uploading: false
        });
      }
    }

    this.setState({
      [name]: value
    } as any);
  };
}

export default EditAccountContainer;
