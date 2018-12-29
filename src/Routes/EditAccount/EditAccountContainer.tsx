import axios from "axios";
import React from "react";
import { Mutation, Query } from "react-apollo";
import { RouteComponentProps } from "react-router-dom";
import { toast } from "react-toastify";
import { USER_PROFILE } from "src/sharedQueries";
import { userProfile } from "../../types/api";
import { updateProfile, updateProfileVariables } from "../../types/api";
import EditAccountPresenter from "./EditAccountPresenter";
import { UPDATE_PROFILE } from "./EditAccountQueries";

interface IState {
  isLoaded: boolean;
  firstName: string;
  lastName: string;
  email: string;
  profilePhoto: string;
  uploading: boolean;
}

interface IProps extends RouteComponentProps<any> {}

class UpdateProfileMutation extends Mutation<
  updateProfile,
  updateProfileVariables
> {}

class ProfileQuery extends Query<userProfile> {}

class EditAccountContainer extends React.Component<IProps, IState> {
  public state = {
    email: "",
    firstName: "",
    isLoaded: false,
    lastName: "",
    profilePhoto: "",
    uploading: false
  };
  public userProfile = {
    email: "",
    firstName: "",
    lastName: "",
    profilePhoto: "",
    uploading: false
  };
  public render() {
    return (
      <ProfileQuery
        query={USER_PROFILE}
        fetchPolicy={"cache-and-network"}
        onCompleted={() => {
          console.log("onCompleted");
        }}
      >
        {({ data, loading, error }) => {
          if (loading) {
            return null;
          }
          if (!data) {
            return null;
          }

          if (data) {
            const {
              GetMyProfile: { user }
            } = data;

            if (user) {
              this.userProfile = {
                email: user.email || "",
                firstName: user.firstName,
                lastName: user.lastName,
                profilePhoto: user.profilePhoto || "",
                uploading: false
              };
            }
          }

          let { email, firstName, lastName, profilePhoto } = this.userProfile;
          const uploading = this.state.uploading;

          if (this.state.isLoaded) {
            email = this.state.email;
            firstName = this.state.firstName;
            lastName = this.state.lastName;
            profilePhoto = this.state.profilePhoto;
          }
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
        }}
      </ProfileQuery>
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
      this.userProfile.uploading = true;

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
        // this.setState({
        //   profilePhoto: secure_url,
        //   uploading: false
        // });
        this.userProfile.profilePhoto = secure_url;
        this.userProfile.uploading = false;
        if (this.state.isLoaded) {
          this.setState({
            profilePhoto: secure_url,
            uploading: false
          });
        }
      }
    }

    if (!this.state.isLoaded) {
      console.log("a");
      this.userProfile[name] = value;
      console.log(this.userProfile);
      this.setState({
        email: this.userProfile.email,
        firstName: this.userProfile.firstName,
        isLoaded: true,
        lastName: this.userProfile.lastName,
        profilePhoto: this.userProfile.profilePhoto,
        uploading: this.userProfile.uploading
      });
    } else {
      console.log("b");
      this.setState({
        [name]: value
      } as any);
    }
  };
}

export default EditAccountContainer;
