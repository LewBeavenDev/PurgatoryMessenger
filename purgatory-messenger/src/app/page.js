"use client"

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './globals.css';
import Logo from '../../public/Purgatory.png';
import Image from 'next/image';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // State to track login status
  const [username, setUsername] = useState(''); // State for username input
  const [password, setPassword] = useState(''); // State for password input
  const [entries, setEntries] = useState([]);
  const [uniqueArtists, setUniqueArtists] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState('');
  const [message, setMessage] = useState('');
  const [contactNumbers, setContactNumbers] = useState([]);
  const [testNumber, setTestNumber] = useState(''); // State for test number input
  const [alertMessage, setAlertMessage] = useState(''); // State for alert message
  const [showSendButton, setShowSendButton] = useState(true); // State to control button visibility

  // Dummy login function (you can replace this with a real authentication mechanism)
  const handleLogin = (event) => {
    event.preventDefault();
    if (username === 'purgatorytattoos@yahoo.com' && password === 'Scabcannon1!') { // Replace with your own credentials check logic
      setIsAuthenticated(true);
      setAlertMessage(''); // Clear any alert messages after successful login
    } else {
      setAlertMessage('Invalid username or password.');
    }
  };

  async function fetchEntries() {
    try {
      const response = await axios.get('https://purgatoryform.co.uk/wp-json/gf/v2/forms/1/entries', {
        auth: {
          username: 'Purgatory-Reg',
          password: 'T3uZ gnIP TOgH 80Aq uM91 kJjg'
        },
        params: {
          'paging[page_size]': 1000
        }
      });
  
      const entryData = response.data.entries.map(entry => ({
        id: entry.id,
        artistName: entry['8'] || 'N/A',
        clientName: entry['46'] || 'N/A',
        contactNumber: entry['36'] ? formatPhoneNumber(entry['36']) : 'N/A',
        agreeToMailingList: entry['23.2'] === 'I agree to Join the mailing list.' // Check for mailing list agreement
      }));
  
      // Filter entries to only include those who agreed to join the mailing list
      const filteredEntries = entryData.filter(entry => entry.agreeToMailingList);
  
      setEntries(filteredEntries);
  
      const artists = [
        'All Artists',
        '-Test-',
        ...new Set(filteredEntries.map(entry => entry.artistName).filter(artistName => artistName !== 'N/A'))
      ];
      const sortedArtists = artists.slice(2).sort((a, b) => a.localeCompare(b));
      setUniqueArtists(['-Test-', 'All Artists', ...sortedArtists]);
  
    } catch (error) {
      console.error('Error fetching entries:', error.response ? error.response.data : error.message);
    }
  }
  

  const formatPhoneNumber = (number) => {
    return number.replace(/\s+/g, '').replace('+44', '0');
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchEntries();
    }
  }, [isAuthenticated]);

  const handleArtistChange = (e) => {
    const artist = e.target.value;
    setSelectedArtist(artist);
    setShowSendButton(true); // Show the send button when a new artist is selected
    setAlertMessage(''); // Clear any existing alert message

    if (artist === 'All Artists') {
      setContactNumbers(entries.map(entry => entry.contactNumber));
    } else if (artist === '-Test-') {
      setContactNumbers([]);
    } else {
      const filteredNumbers = entries.filter(entry => entry.artistName === artist).map(entry => entry.contactNumber);
      setContactNumbers(filteredNumbers);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!message) {
      setAlertMessage('Please enter a message.');
      return;
    }

    const formattedNumbers = [];

    if (selectedArtist && selectedArtist !== 'All Artists' && selectedArtist !== '-Test-') {
      formattedNumbers.push(...contactNumbers.map(number => `whatsapp:${number}`));
    }

    if (selectedArtist === '-Test-' && testNumber) {
      formattedNumbers.push(`whatsapp:${testNumber}`);
    }

    if (formattedNumbers.length === 0) {
      setAlertMessage('Please provide a test number or select an artist with associated contact numbers.');
      return;
    }

    try {
      const payload = {
        messages: formattedNumbers.map(number => ({
          to: number,
          source: 'javascript',
          body: message,
          from: '+447355291499',
        }))
      };

      const response = await axios.post('https://rest.clicksend.com/v3/sms/send', payload, {
        auth: {
          username: 'purgatorytattoos@yahoo.com',
          password: '9AB012B0-62AB-F26C-01A3-BF63637BAF3B'
        }
      });

      console.log('Message response:', response.data);
      setAlertMessage('Messages sent successfully!');
      setShowSendButton(false); // Hide the send button after successful submission

      // Reset the form to default state
      setSelectedArtist('');
      setMessage('');
      setContactNumbers([]);
      setTestNumber('');
    } catch (error) {
      console.error('Error sending messages:', error.response ? error.response.data : error.message);
      setAlertMessage('Failed to send messages. Please try again.');
      setShowSendButton(false); // Hide the send button on error
    }
  };

  // Render the login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className='flex flex-col justify-center items-center min-h-screen'>
        <Image src={Logo} alt="Logo" className='w-72 mt-2' />
        <h1 className='font-bold text-4xl my-10'>Login</h1>
        <form onSubmit={handleLogin} className='flex flex-col items-center bg-black border border-amber-200 rounded-md p-5'>
          <div className='mb-3'>
            <label htmlFor="username" className='block text-gray-300 mb-1'>Email:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className='p-2 text-white bg-black border border-amber-200 rounded-md w-64'
            />
          </div>
          <div className='mb-3'>
            <label htmlFor="password" className='block text-gray-300 mb-1'>Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className='p-2 text-white bg-black border border-amber-200 rounded-md w-64'
            />
          </div>
          <button type="submit" className='border border-amber-200 bg-black rounded-md px-4 py-2 mt-3'>Login</button>
        </form>
        {alertMessage && (
          <div className='border border-amber-200 bg-black rounded-md px-4 py-2 w-80 text-center text-gray-500 mt-3'>
            {alertMessage}
          </div>
        )}
      </div>
    );
  }

  // Render the main form if authenticated
  return (
    <div className='flex flex-col justify-center items-center'>
      <Image src={Logo} alt="Logo" className='w-72 mt-2' />
      <h1 className='font-bold text-4xl my-10'>Message Form</h1>
      <div className='flex flex-col justify-center items-center'>
        <form onSubmit={handleSubmit} className='flex flex-col'>
          <div className='flex justify-between w-80'>
            <label htmlFor="artistName" className='text-left mr-3 pl-2 py-1'>Select&nbsp;Artist:</label>
            <select
              id="artistName"
              value={selectedArtist}
              onChange={handleArtistChange}
              className='bg-black border border-amber-200 rounded-md h-8 pl-2 mb-3 w-8/12'
            >
              <option value="">  -- Artist --</option>
              {uniqueArtists.map((artistName, index) => (
                <option key={index} value={artistName}>
                  {artistName}
                </option>
              ))}
            </select>
          </div>

          {selectedArtist === '-Test-' && (
            <div className='flex justify-between'>
              <label htmlFor="testNumber" className='text-left mr-3 pl-2 py-1'>Number:</label>
              <input
                type="text"
                id="testNumber"
                value={testNumber}
                onChange={(e) => setTestNumber(e.target.value)}
                placeholder="Enter test number"
                required
                className='bg-black border border-amber-200 rounded-md py-1 pl-2 mb-3 w-[210px]'
              />
            </div>
          )}
          <div className='flex flex-col justify-center'>
            <label htmlFor="message" className='pl-2 mb-3'>Message:</label>
            <div className='flex justify-center'>
              <textarea
                type="text"
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className='p-2 text-left bg-black border border-amber-200 rounded-md h-36 w-80'
              />
            </div>
          </div>

          {showSendButton && (
            <div className='flex justify-center'>
              <button type="submit" className='border border-amber-200 bg-black rounded-md px-1 w-24 mt-3 mb-2'>Send</button>
            </div>
          )}
        </form>
          
        {alertMessage && (
          <div className='border border-amber-200 bg-black rounded-md px-1 w-full text-center text-gray-500 mt-3 mb-2'>
            {alertMessage}
          </div>
        )}
      </div>
    </div>
  );
}
