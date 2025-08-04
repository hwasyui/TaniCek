import React, { useState, useRef, useEffect } from 'react';
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
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(3);

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

  const stopWebcam = () => {
    const video = videoRef.current;
    if (video && video.srcObject) {
      const stream = video.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      video.srcObject = null;
    }
  };

  const captureAndVerifyFace = async () => {
    const video = videoRef.current;
    if (!video) return;

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
        stopWebcam();

        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser.isAdmin && !storedUser.isDeveloper) {
          navigate("/dashboard");
        } else if (storedUser.isAdmin && !storedUser.isDeveloper) {
          navigate("/AdminDashboard");
        } else {
          navigate("/DeveloperDashboard");
        }
      } else {
        setError("Face not matched. Access denied.");
        stopWebcam();
        setShowModal(false);
      }
    } catch (err) {
      console.error("Face verification failed:", err);
      setError("Face verification error.");
      stopWebcam();
      setShowModal(false);
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

      if (token && user) {
        localStorage.setItem('token', token);
        setAuthToken(token);
        localStorage.setItem('user', JSON.stringify(user));
        console.log("Login successful");

        setShowModal(true);
        setCountdown(3);
      } else {
        setError("Login failed: Invalid response");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let timer;
    if (showModal && countdown > 0) {
      timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    } else if (showModal && countdown === 0) {
      startWebcam();
      setTimeout(() => {
        captureAndVerifyFace();
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [showModal, countdown]);

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
      </div>

      {/* Face Detection Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center w-96">
            {countdown > 0 ? (
              <>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                  Detecting your face in:
                </h3>
                <p className="text-5xl font-bold text-green-600 animate-pulse">{countdown}</p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Detecting Face...</h3>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  width="320"
                  height="240"
                  className="mx-auto rounded border"
                />
                <p className="text-gray-500 mt-2 text-sm">Please look directly at the camera</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SignIn;
