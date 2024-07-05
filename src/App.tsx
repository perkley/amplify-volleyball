import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import Home from './components/Home';
import EditPool from './components/EditPool';

const App: React.FC = () => {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <Router>
          <main>
            <h1>{user?.signInDetails?.loginId}'s View</h1>
            <Routes>
              <Route path="/" element={<Home user={user}  signOut={signOut} />} />
              <Route path="/edit/:id" element={<EditPool />} />
            </Routes>
          </main>
        </Router>
      )}
    </Authenticator>
  );
}

export default App;