import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import Home, { createPool } from './components/Home';
import EditPool from './components/EditPool';
import ViewBrackets from './components/ViewBrackets';
import { fetchAuthSession } from 'aws-amplify/auth';
import AppMenu from './components/AppMenu';



const CustomHeader = () => (
  <header>
    <h1 className="taCenter">Southern LA Volleyball Association</h1>
  </header>
);


const App: React.FC = () => {
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const session = await fetchAuthSession();
        const groups = session.tokens?.accessToken?.payload['cognito:groups']?.toString().split(',') || [];
        // console.log('groups', groups, typeof(groups));
        const isAdminUser = groups.includes('Administrator');
        setIsAdmin(isAdminUser);
        // console.log('after', groups, isAdminUser);
      } catch (error) {
        console.error('Error fetching auth session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, []);

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

            <h3>Logged in as {user?.signInDetails?.loginId}</h3>

            <AppMenu signOut={signOut} createPool={createPool} isAdmin={isAdmin} />
            
            <Routes>
              <Route path="/" element={<Home user={user} isAdmin={isAdmin} />} />
              <Route path="/edit/:id" element={<EditPool />} />
              <Route path="/brackets/" element={<ViewBrackets />} />
            </Routes>
          </main>
        </Router>
      )}
    </Authenticator>
  );
}

export default App;
