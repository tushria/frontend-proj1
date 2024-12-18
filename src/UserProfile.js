import React, { useState, useEffect, useRef } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getDatabase, ref, get, update } from 'firebase/database';
import './UserProfile.css';
import Header from './Component/Header';
import { useNavigate } from 'react-router-dom';
import Footer from './Component/Footer';

function UserProfile() {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState(''); // Username state
  const [displayName, setDisplayName] = useState('');
  const [emailid, setEmailid] = useState('');
  const inputRef = useRef(null);
  const [image, setImage] = useState('');
  const navigate = useNavigate();

  // Function to handle image upload
  const handleImageClick = () => {
    inputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
  };

  // Logout function
  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        setUser(null);
        setUserName('');
        setDisplayName('');
        setEmailid('');
        setImage('');
        localStorage.removeItem('username');
        navigate('/login');
      })
      .catch((error) => {
        console.error('Error signing out:', error);
      });
  };

  // Save username to Firebase and local storage
  const saveUserNameToFirebase = (userId, newUsername) => {
    const database = getDatabase();
    const userRef = ref(database, `users/${userId}`);
    update(userRef, { username: newUsername })
      .then(() => {
        console.log('Username updated successfully');
        localStorage.setItem('username', newUsername); // Save to local storage
      })
      .catch((error) => {
        console.error('Error updating username:', error);
      });
  };

  // Handle user profile loading from Firebase
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userId = user.uid;
        const database = getDatabase();
        const userRef = ref(database, `users/${userId}`);
        get(userRef).then((snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.val();
            setUserName(userData.username); // Load username
            setDisplayName(user.displayName);
            setEmailid(user.email);
            setUser(user);
            if (userData.username) {
              localStorage.setItem('username', userData.username); // Save to localStorage
            }
          } else {
            console.log('No user data found');
          }
        });
      } else {
        console.log('No user logged in');
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className='main-body'>
      <div className='inner-box1'>
        <section className='blured-box'>
          <Header />
          <div id="userProfile">
            <div className='userpro-h'>
                <h1 >User Profile</h1>
            </div>
          <div className='outter-box-userPro'>
            <div className="file-input-container" onClick={handleImageClick}>
              {image ? (
                <img className="userimg" src={URL.createObjectURL(image)} alt='' />
              ) : (
                <img src="./by_default_user.jpg" alt='' />
              )}
              <input 
                type="file" 
                ref={inputRef} 
                onChange={handleImageChange} 
                style={{ display: 'none' }} 
              />
            </div>
            <div className='u-detail'>
              <p>Username: {displayName}</p> 
              <p>Registered email-id: {emailid}</p>
            </div>
          </div>
          <div className='user-btn-logout'>
            <button className="userBtn" onClick={handleLogout}>Logout</button>
          </div>
            
          </div>
        </section>
        <Footer/>
      </div>
    </div>
  );
}

export default UserProfile;
