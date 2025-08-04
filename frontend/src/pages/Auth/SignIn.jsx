import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [faceVerified, setFaceVerified] = useState(false);
  const [authToken, setAuthToken] = useState(null);

  const startWebcam = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }).catch((err) => {
        console.error("Webcam error:", err);
      });
  };

  const captureAndVerifyFace = async () => {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const base64Image = canvas.toDataURL('image/jpeg');

    try {
      const res = await axios.post("http://localhost:5000/face-verify", {
        email,
        webcam: base64Image
      });

      if (res.data.verified) {
        setFaceVerified(true);
        console.log("Face verified");
        navigate("/dashboard");
      } else {
        setError("Face not matched. Access denied.");
      }
    } catch (err) {
      console.error("Face verification failed:", err);
      setError("Face verification error.");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:3000/auth/login', {
        email,
        password,
      });

      const { token, user } = response.data;

      if (token) {
        localStorage.setItem('token', token);
        setAuthToken(token);
        localStorage.setItem('user', JSON.stringify(user));
        console.log("Login successful");
        startWebcam();
      } else {
        setError("Login failed: No token received");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-bg">
      <div className="bg-card-bg p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-3xl font-bold text-center text-green-500 mb-6">TaniCek</h2>
        <p className="text-xl text-center text-text-dark mb-8">Sign in to your account</p>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-text-dark text-sm font-semibold mb-2" htmlFor="email"> Email </label>
            <input
              className="shadow appearance-none border border-border-light rounded w-full py-2 px-3 text-text-dark leading-tight focus:outline-none focus:ring-2 focus:ring-green-500"
              id="email"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-text-dark text-sm font-semibold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="shadow appearance-none border border-border-light rounded w-full py-2 px-3 text-text-dark leading-tight focus:outline-none focus:ring-2 focus:ring-green-500"
              id="password"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="text-red-500 text-xs italic mt-2">{error}</p>}
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Login'}
            </button>
          </div>
          <p className="text-center text-sm text-text-dark mt-4">
            Don't have account yet or forgot your credentials?
          </p>
          <p className="text-center text-sm text-blue-500 mt-2">
            Ask your admin for help. 
          </p>
        </form>
        {authToken && !faceVerified && (
          <div className="mt-8 text-center">
            <h3 className="text-lg text-text-dark font-semibold mb-2">Verifying Face...</h3>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              width="320"
              height="240"
              className="mx-auto rounded border"
            />
            <button
              onClick={captureAndVerifyFace}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Verify Face
            </button>
          </div>
        )}
        {faceVerified && (
          <p className="text-green-500 text-center mt-4">Face verified successfully!</p>
        )}
      </div>
    </div>
  );
};

export default SignIn;
