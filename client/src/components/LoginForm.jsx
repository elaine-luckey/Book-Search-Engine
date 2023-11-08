/* eslint-disable no-unused-vars */
// see SignupForm.js for comments
import { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';

// import { loginUser } from '../utils/API';
import Auth from '../utils/auth';

//import necessary modules
import { useMutation } from '@apollo/client';
import { LOGIN_USER } from '../utils/mutations';

//initializing state variables using the useState hook
const LoginForm = () => {
  const [userFormData, setUserFormData] = useState({ email: '', password: '' });
  const [validated] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

//defining a GraphQl mutation and its execution function using the useMutation
  const [loginUser, _] = useMutation(LOGIN_USER);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUserFormData({ ...userFormData, [name]: value });
  };

  //handles the form submission
  const handleFormSubmit = async (event) => {
    event.preventDefault();

    // check if form has everything (as per react-bootstrap docs)
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }

    try {
      //execute the 'loginUser' mutation with userFormData as variables
      const { data } = await loginUser({
        variables: { ...userFormData }
      });

      //log response data to the console
      console.log(data);

      //call the 'login' method from the 'Auth' module with the token from the response data
      Auth.login(data.login.token);
    } catch (err) {
      //handle errors by logging to the console and displaying an alert
      console.error(err);
      setShowAlert(true);
    }

    //reset the userFormData after form submission
    setUserFormData({
      username: '',
      email: '',
      password: '',
    });
  };

  //return the JSX elements for the login form
  return (
    <>
      <Form noValidate validated={validated} onSubmit={handleFormSubmit}>
        <Alert dismissible onClose={() => setShowAlert(false)} show={showAlert} variant='danger'>
          Something went wrong with your login credentials!
        </Alert>
        <Form.Group className='mb-3'>
          <Form.Label htmlFor='email'>Email</Form.Label>
          <Form.Control
            type='text'
            placeholder='Your email'
            name='email'
            onChange={handleInputChange}
            value={userFormData.email}
            required
          />
          <Form.Control.Feedback type='invalid'>Email is required!</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className='mb-3'>
          <Form.Label htmlFor='password'>Password</Form.Label>
          <Form.Control
            type='password'
            placeholder='Your password'
            name='password'
            onChange={handleInputChange}
            value={userFormData.password}
            required
          />
          <Form.Control.Feedback type='invalid'>Password is required!</Form.Control.Feedback>
        </Form.Group>
        <Button
          disabled={!(userFormData.email && userFormData.password)}
          type='submit'
          variant='success'>
          Submit
        </Button>
      </Form>
    </>
  );
};

export default LoginForm;