import React, { useState } from 'react';
import Style from "../App.module.css";
import { Link , useNavigate} from "react-router-dom";
import { GoogleLogin} from '@react-oauth/google'; // Import GoogleLogin component
import { ToastContainer, toast , Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";

function Login() {

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  

  const handleGoogleLogin = (response) => {
    console.log(response); // Handle Google login response here
    // You can send the response to your backend for further processing
  };

const loginUser = async () => {
  
  if (emailAddress && password) {
      try {
          const response = await axios.post("http://localhost:5000/loginUser", {
              emailAddress,
              password,
          });

          if (response.status === 200) {
              const { token, message , user } = response.data;

              // Store the token in localStorage
              localStorage.setItem("authToken", token);
              localStorage.setItem("userFirstName",user.firstName);
              localStorage.setItem("userLastName",user.lastName);
              localStorage.setItem("userEmailAddress",user.emailAddress);
              
              
              toast.success(`${message}`, {
                  position: "top-right",
                  autoClose: 5000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                  theme: "colored",
                  transition: Bounce,
                  className: Style.customToast,
              });

              setTimeout(() => {
                  navigate("/mainPage");
              }, 5000);
          }
      } catch (error) {
          if (error.response?.status === 401) {
              toast.warn('User not found or invalid credentials! Please check your details.', {
                  position: "top-right",
                  autoClose: 5000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                  theme: "colored",
                  transition: Bounce,
                  className: Style.customToast,
              });
          } else {
              toast.error('Oops! We couldn’t log you in. Please try again later.', {
                  position: "top-right",
                  autoClose: 5000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                  theme: "colored",
                  transition: Bounce,
                  className: Style.customToast,
              });
          }
      }
  } else {
      toast.error('All fields are required!', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
          transition: Bounce,
          className: Style.customToast,
      });
  }
};


  return (
    <>
      <div className={Style.mainDiv}>
        <div className={Style.loginDivMain}>
          <div className={Style.NavBarLoginDiv}>
            <h1>AspireBot</h1>
            <Link className={Style.createAccountLink} to="/createAccount">Create Account</Link>
          </div>
          <div className={Style.loginDiv1}>
            <div className={Style.loginContentDiv}>
              <h1 className={Style.loginContentDivHeading}>Sign in to AspireBot</h1>
              <p className={Style.loginContentDivPara}>Discover. Learn. Achieve. Join CareerClimb Today</p>
              <div className={Style.InputContentDiv}>
                <p className={Style.paraInput}>Email</p>
                <input type="text" placeholder='Your email address' className={Style.emailInput} value={emailAddress} onChange={(e)=>{
                  setEmailAddress(e.target.value)
                }}/>
              </div>
              <div className={Style.InputContentDiv1}>
                <p className={Style.paraInput}>Password</p>
                <input type="password" placeholder='Your Password' className={Style.emailInput} value={password} onChange={(e)=>{
                  setPassword(e.target.value)
                }}/>
              </div>
              <div className={Style.loginBtnDiv}>
                <button className={Style.loginBtn} onClick={loginUser}>Sign In</button>
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
        <ToastContainer/>
      </div>
    </>
  );
}

export default Login;
