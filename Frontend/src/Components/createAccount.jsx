import React, { useState } from 'react';
import Style from "../App.module.css";
import { Link } from "react-router-dom";
import { GoogleLogin} from '@react-oauth/google'; // Import GoogleLogin component
import { ToastContainer, toast , Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";

function CreateAccount() {

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");

  const handleGoogleLogin = (response) => {
    console.log(response); // Handle Google login response here
    // You can send the response to your backend for further processing
  };

  async function createAccount() {
    if (firstName && lastName && emailAddress && password) {
        try {
            const response = await axios.post("http://localhost:5000/createAccount", {
                firstName,
                lastName,
                emailAddress,
                password
            });

            if (response.status === 201) {
                toast.success('Account Created Successfully! Welcome to Cryptopulse!', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                    transition: Bounce,
                    className: Style.customToast
                });
            }
        } catch (error) {
            if (error.response?.status === 400) {
                toast.warn('User already exists! Please sign in.', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                    transition: Bounce,
                    className: Style.customToast
                });
            } else {
                toast.error('Oops! We couldn’t create your account. An error occurred.', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                    transition: Bounce,
                    className: Style.customToast
                });
            }
        }
    } else {
        toast.error('All fields are required.', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
            transition: Bounce,
            className: Style.customToast
        });
    }
}



  return (
    <>
      <div className={Style.mainDiv}>
        <div className={Style.loginDivMain}>
          <div className={Style.NavBarLoginDiv}>
            <h1>AspireBot</h1>
            <Link className={Style.createAccountLink} to="/">Back to login</Link>
          </div>
          <div className={Style.loginDiv1}>
            <div className={Style.loginContentDiv1}>
              <h1 className={Style.loginContentDivHeading}>Create your account</h1>
              <p className={Style.loginContentDivPara}>Welcome to AspireBot: Your Path to Success</p>
              <div className={Style.InputContentDiv3}>
                <div className={Style.InputContentDivName}>
                <div className={Style.InputContentDivEmail}>
                <p className={Style.paraInput}>First Name</p>
                <input type="text" placeholder='Your first name' className={Style.emailInput} value={firstName} onChange={(e)=>{setFirstName(e.target.value)}}/>
              </div>
              <div className={Style.InputContentDivPassword}>
                <p className={Style.paraInput}>Last Name</p>
                <input type="text" placeholder='Your last name' className={Style.emailInput} value={lastName} onChange={(e)=>{setLastName(e.target.value)}}/>
              </div>
                </div>
              </div>
              <div className={Style.InputContentDiv1}>
                <p className={Style.paraInput}>Email</p>
                <input type="email" placeholder='Your email address' className={Style.emailInput} value={emailAddress} onChange={(e)=>{setEmailAddress(e.target.value)}}/>
              </div>
              <div className={Style.InputContentDiv1}>
                <p className={Style.paraInput}>Password</p>
                <input type="password" placeholder='Your Password' className={Style.emailInput} value={password} onChange={(e)=>{setPassword(e.target.value)}}/>
              </div>
              <div className={Style.loginBtnDiv}>
                <button className={Style.loginBtn} onClick={createAccount}>Create Account</button>
              </div>
              <div className={Style.orParaDiv}>
                <p>OR</p>
              </div>
              <div className={Style.googleSignINDiv}>
                <div className={Style.googleSignINDiv1}>
                <GoogleLogin
                  onSuccess={handleGoogleLogin}
                  onError={() => console.log('Login Failed')}
                  useOneTap
                  className={Style.googleLoginBtn}  // Add className here
                />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer/>
    </>
  );
}

export default CreateAccount;