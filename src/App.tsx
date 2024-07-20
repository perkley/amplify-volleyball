import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
// import Home, { seedPoolGroupData } from './components/Home';
import PoolGroup from './components/PoolGroup';
import EditPool from './components/EditPool';
import ViewBrackets from './components/ViewBrackets';
import { fetchAuthSession } from 'aws-amplify/auth';
import AppMenu from './components/AppMenu';
import { Hub } from 'aws-amplify/utils';
//import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';

const CustomHeader = () => (
  <header>
    <h1 className="taCenter">Southern LA Volleyball Association</h1>
  </header>
);


const App: React.FC = () => {
  
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const loadSession = async () => {
      try {
        await updateAdminStatus();
      } catch (error) {
        console.error('Error loading session:', error);
      } finally {
        setIsLoading(false);
      }
    };
  
    loadSession();
  }, []);

  useEffect(() => {
    const authListener = Hub.listen('auth', async (data) => {
      switch (data.payload.event) {
        case 'signedIn':
        case 'tokenRefresh':
          await updateAdminStatus();
          break;
        case 'signedOut':
          setIsAdmin(false);
          break;
      }
    });
  
    updateAdminStatus();
  
    return () => {
      authListener();
    };
  }, []);
  
  const updateAdminStatus = async () => {
    try {
      const session = await fetchAuthSession();
      const groups = session.tokens?.accessToken?.payload['cognito:groups'];
      
      if (Array.isArray(groups)) {
        setIsAdmin(groups.includes('Administrator'));
      } else if (typeof groups === 'string') {
        setIsAdmin(groups.split(',').includes('Administrator'));
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error fetching auth session:', error);
      setIsAdmin(false);
    }
  };


  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    
    <Authenticator
    components={{
      Header: CustomHeader,
    }}>
      {({ signOut, user }) => (
        
        <Router>
          
          <main>
            {CustomHeader()}

            <h3>{isAdmin ? 'Administrator' : 'Viewer'}</h3>
            {/* <h3>Logged in as {user?.signInDetails?.loginId}</h3> */}

            <AppMenu signOut={signOut} isAdmin={isAdmin} />
            
            <Routes>
              <Route path="/" element={<PoolGroup user={user} isAdmin={isAdmin} />} />
              <Route path="/edit/:id" element={<EditPool />} />
              <Route path="/brackets/" element={<ViewBrackets isAdmin={isAdmin} />} />
            </Routes>
          </main>
        </Router>
      )}
    </Authenticator>
  );
}

export default App;
