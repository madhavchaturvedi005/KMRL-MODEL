import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Signup: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to request access page
    navigate('/request-access', { replace: true });
  }, [navigate]);

  return null;
};

export default Signup;