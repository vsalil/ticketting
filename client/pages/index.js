 import buildClient from '../api/build-client';

const LandingPage = ({ currentUser }) => {
  
  console.log(currentUser);

  return currentUser ? <h4>You are signed In</h4> 
                     : <h4>You are NOT Signed In</h4>;
                    };

LandingPage.getInitialProps = async (context) => {
  const client = buildClient(context);
  console.log('LANDING PAGE');
  const { data } = await client.get(
    '/api/users/currentuser');
  return data;
};

export default LandingPage;
  