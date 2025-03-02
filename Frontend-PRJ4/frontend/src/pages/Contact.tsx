import React, { useState } from 'react';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const webhookUrl = 'https://discord.com/api/webhooks/1311329541926686781/GOEiPZyGuA3hzNcOBgPhXN2f5aPpJynrK-Avxn678K92e6erGBOzHZYU9K3XvEznkuet';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const { name, email, message } = formData;

    const payload = {
      content: `**Ny besked fra kontaktformular (/kontakt)**\n\n**Navn:** ${name}\n**Email:** ${email}\n**Besked:**\n${message}`
    };

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setFormData({ name: '', email: '', message: '' });
        alert('Besked sendt!');
      } else {
        setError('Kunne ikke sende besked. Prøv igen.');
      }
    } catch (error) {
      setError('Der opstod en fejl. Prøv igen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen bg-white text-gray-600 dark:bg-gray-800 dark:text-gray-300 p-6`}>
      <h1 className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500">
        Kontakt os
      </h1>
      <p className="text-xl mb-4 max-w-3xl text-center">
        Har du spørgsmål eller brug for hjælp? Du er velkommen til at kontakte os via nedenstående oplysninger eller udfylde kontaktformularen.
      </p>

      <div className="mt-8 w-full max-w-md">
        <form className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg shadow-md" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="name">
              Navn
            </label>
            <input
              className="w-full px-3 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-transform duration-200 ease-in-out transform focus:scale-105"
              id="name"
              type="text"
              placeholder="Dit navn"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="w-full px-3 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-transform duration-200 ease-in-out transform focus:scale-105"
              id="email"
              type="email"
              placeholder="Din email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="message">
              Besked
            </label>
            <textarea
              className="w-full px-3 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-transform duration-200 ease-in-out transform focus:scale-105"
              id="message"
              placeholder="Din besked"
              rows={5}
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sender...' : 'Send'}
            </button>
          </div>
          {error && <p className="mt-4 text-red-500">{error}</p>}
        </form>
      </div>

      <div className="mt-8 mb-4 w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4">Kontaktoplysninger</h2>
        <p className="text-lg">
          Email: <a href="mailto:info@purchase4less.com" className="text-indigo-600 dark:text-indigo-400">info@purchase4less.com</a>
        </p>
        <p className="text-lg">
          Telefon: <a href="tel:+4512345678" className="text-indigo-600 dark:text-indigo-400">+45 87 15 00 00</a>
        </p>
        <p className="text-lg">
          Adresse: <span className="text-gray-700 dark:text-gray-300">Finlandsgade 22, 8200 Aarhus N, Danmark</span>
        </p>
      </div>
    </div>
  );
};

export default ContactPage;