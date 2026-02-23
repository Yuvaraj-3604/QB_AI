
import React, { useState } from 'react';
import { Check, Clock, Video, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card } from '@/Components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    startOfWeek,
    endOfWeek,
    isToday
} from 'date-fns';
import emailjs from '@emailjs/browser';
import { API_URL } from '../config';

const BookDemo = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [bookingStep, setBookingStep] = useState('calendar'); // 'calendar' | 'form' | 'success'
    const [selectedTime, setSelectedTime] = useState(null);
    const [bookingLink, setBookingLink] = useState('');
    const [isSending, setIsSending] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        organization: '',
        email: '',
        phone: '',
        source: '',
        notes: ''
    });

    const [selectedCountry, setSelectedCountry] = useState({ code: 'US', name: 'United States', dialCode: '+1', flag: 'https://flagcdn.com/w20/us.png' });
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);

    const countries = [
        { code: 'US', name: 'United States', dialCode: '+1', flag: 'https://flagcdn.com/w20/us.png' },
        { code: 'IN', name: 'India', dialCode: '+91', flag: 'https://flagcdn.com/w20/in.png' },
        { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: 'https://flagcdn.com/w20/gb.png' },
        { code: 'CA', name: 'Canada', dialCode: '+1', flag: 'https://flagcdn.com/w20/ca.png' },
        { code: 'AU', name: 'Australia', dialCode: '+61', flag: 'https://flagcdn.com/w20/au.png' },
    ];

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const handleTimeSelect = (time) => {
        setSelectedTime(time);
        setBookingStep('form');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleConfirmBooking = (e) => {
        e.preventDefault();
        setIsSending(true);

        const templateParams = {
            to_name: `${formData.firstName} ${formData.lastName}`,
            to_email: formData.email,
            organization: formData.organization,
            phone: `${selectedCountry.dialCode} ${formData.phone}`,
            source: formData.source,
            notes: formData.notes,
            requested_date: format(selectedDate, 'M/d/yy'),
            requested_time: selectedTime,
            meeting_link: "https://meet.google.com/sample-link" // Replace with logic if dynamic link needed
        };

        // TODO: Replace these with your actual EmailJS credentials
        const SERVICE_ID = 'service_mwgoqf7';
        const TEMPLATE_ID = 'template_mg1bx1d';
        const PUBLIC_KEY = '832WdKgLsIe2mjqu9'; // You need to get this from EmailJS dashboard



        // 1. Save to Backend Database
        fetch(`${API_URL}/api/participants`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: `${formData.firstName} ${formData.lastName}`,
                email: formData.email,
                organization: formData.organization,
                phone: `${selectedCountry.dialCode} ${formData.phone}`,
                ticket_type: 'general' // Default or mapped from somewhere
            })
        })
            .then(res => {
                if (!res.ok) throw new Error('Failed to save to database');
                return res.json();
            })
            .then(data => {
                console.log("Saved to database:", data);

                // 2. Send Email via EmailJS
                return emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
            })
            .then((response) => {
                console.log('SUCCESS!', response.status, response.text);
                setBookingStep('success');
                setIsSending(false);
            })
            .catch((err) => {
                console.log('FAILED...', err);
                // Even if DB fails, we might still want to try sending email, or alert user. 
                // For now, simpler to catch all.
                const errorMessage = err.text || err.message || 'Unknown error occurred';
                alert(`Process failed. Error: ${errorMessage}. Please check console.`);
                setIsSending(false);
            });
    };

    const days = eachDayOfInterval({
        start: startOfWeek(startOfMonth(currentMonth)),
        end: endOfWeek(endOfMonth(currentMonth))
    });

    const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    if (bookingStep === 'success') {
        const subject = `New Demo Booking: ${formData.firstName} ${formData.lastName}`;
        const body = `
Dear ${formData.firstName} ${formData.lastName},

Thank you for your interest in Questbridge. This email serves as a formal confirmation that you have successfully registered for a product demo session.

We have recorded your preferences and are coordinating with our product specialists. We will share the comprehensive session details, including the meeting agenda and a direct link to join the session, in a separate communication shortly.

Please find below a summary of the information provided during your registration:

Name: ${formData.firstName} ${formData.lastName}
Organization: ${formData.organization}
Email: ${formData.email}
Phone: ${selectedCountry.dialCode} ${formData.phone}
Source: ${formData.source}
Notes: ${formData.notes}

Requested Time: ${format(selectedDate, 'M/d/yy')}, ${selectedTime}
        `.trim();

        const encodedSubject = encodeURIComponent(subject);
        const encodedBody = encodeURIComponent(body);
        const encodedEmail = encodeURIComponent(formData.email);

        const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodedEmail}&su=${encodedSubject}&body=${encodedBody}`;
        const outlookLink = `https://outlook.office.com/mail/deeplink/compose?to=${encodedEmail}&subject=${encodedSubject}&body=${encodedBody}`;
        const yahooLink = `https://compose.mail.yahoo.com/?to=${encodedEmail}&subject=${encodedSubject}&body=${encodedBody}`;
        const defaultLink = `mailto:${formData.email}?subject=${encodedSubject}&body=${encodedBody}`;

        return (
            <div className="min-h-screen bg-white p-8 md:p-12 lg:p-20 flex justify-center items-center">
                <Card className="max-w-md w-full p-8 text-center space-y-6">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                        <Check className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
                        <p className="text-gray-600 mb-4">
                            Thank you for scheduling a demo. We have prepared an email with your details.
                        </p>
                        <p className="text-sm text-gray-500 mb-4">
                            Please select your email provider to send the confirmation:
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div className="space-y-2">
                            <Button asChild className="w-full bg-teal-900 hover:bg-teal-800 text-white cursor-pointer h-12">
                                <a href={defaultLink}>
                                    Open Default Email App
                                </a>
                            </Button>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <Button asChild variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50 cursor-pointer h-10">
                                <a href={gmailLink} target="_blank" rel="noopener noreferrer">
                                    Gmail
                                </a>
                            </Button>
                            <Button asChild variant="outline" className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 cursor-pointer h-10">
                                <a href={outlookLink} target="_blank" rel="noopener noreferrer">
                                    Outlook
                                </a>
                            </Button>
                            <Button asChild variant="outline" className="w-full border-purple-200 text-purple-600 hover:bg-purple-50 cursor-pointer h-10">
                                <a href={yahooLink} target="_blank" rel="noopener noreferrer">
                                    Yahoo
                                </a>
                            </Button>
                        </div>

                        <div className="pt-4">
                            <Button variant="ghost" onClick={() => window.location.reload()} className="w-full text-gray-500 hover:text-gray-700">
                                Back to Home
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white p-8 md:p-12 lg:p-20 flex justify-center">
            <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left Column */}
                <div className="space-y-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Book a Demo</h1>
                        <p className="text-gray-600 text-lg leading-relaxed">
                            See how Questbridge can help your team create stunning events in seconds,
                            automate registrations, and track analytics instantly—all with
                            complete traceability.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                <Check className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 text-lg">See the platform in action</h3>
                                <p className="text-gray-500 mt-1">
                                    Live walkthrough of event creation, registration automation, and analytics dashboard.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                <Check className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 text-lg">Discuss your specific needs</h3>
                                <p className="text-gray-500 mt-1">
                                    We'll understand your workflow and show how Questbridge can help.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                <Check className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 text-lg">Get your questions answered</h3>
                                <p className="text-gray-500 mt-1">
                                    Security, compliance, implementation—we'll cover it all.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Booking Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="p-8 space-y-6">
                        <div className="flex items-center gap-4">
                            <Avatar className="w-12 h-12">
                                <AvatarImage src="https://ui.shadcn.com/avatars/04.png" />
                                <AvatarFallback className="bg-cyan-500 text-white font-bold">Q</AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="font-bold text-gray-900">Questbridge Team</h3>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">30 min with Questbridge</h2>
                            <div className="space-y-3 text-gray-500">
                                <div className="flex items-center gap-3">
                                    <Clock className="w-5 h-5" />
                                    <span>30 min appointments</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Video className="w-5 h-5" />
                                    <span>Google Meet video conference info added after booking</span>
                                </div>
                                {selectedDate && selectedTime && (
                                    <div className="flex items-center gap-3 font-semibold text-blue-600">
                                        <CalendarIcon className="w-5 h-5" />
                                        <span>{format(selectedDate, 'EEEE, MMMM d, yyyy')} at {selectedTime}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {bookingStep === 'calendar' ? (
                            <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <h4 className="font-semibold text-gray-900">Select an appointment time</h4>
                                <p className="text-sm text-gray-500">(GMT+05:30) India Standard Time</p>

                                <Card className="p-4 border border-gray-200 shadow-none">
                                    <div className="flex items-center justify-between mb-4">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevMonth}>
                                            <ChevronLeft className="w-4 h-4" />
                                        </Button>
                                        <span className="font-semibold text-gray-900">{format(currentMonth, 'MMMM yyyy')}</span>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextMonth}>
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                        {weekDays.map((day, i) => (
                                            <div key={i} className="text-xs font-medium text-gray-500 py-1">
                                                {day}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-7 gap-1 text-center">
                                        {days.map((day, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedDate(day)}
                                                disabled={!isSameMonth(day, currentMonth)}
                                                className={`
                                                    w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors mx-auto
                                                    ${!isSameMonth(day, currentMonth) ? 'text-gray-300 cursor-default' : 'hover:bg-gray-100 text-gray-700'}
                                                    ${selectedDate && isSameDay(day, selectedDate) ? 'bg-blue-100 text-blue-600 font-semibold hover:bg-blue-200' : ''}
                                                    ${isToday(day) && !selectedDate ? 'text-blue-600 font-semibold' : ''}
                                                `}
                                            >
                                                {format(day, 'd')}
                                            </button>
                                        ))}
                                    </div>
                                </Card>

                                {selectedDate && (
                                    <div className="grid grid-cols-2 gap-2 mt-4 animate-in fade-in slide-in-from-top-2">
                                        <Button
                                            variant="outline"
                                            className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
                                            onClick={() => handleTimeSelect('9:00 AM')}
                                        >
                                            9:00 AM
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
                                            onClick={() => handleTimeSelect('9:30 AM')}
                                        >
                                            9:30 AM
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
                                            onClick={() => handleTimeSelect('10:00 AM')}
                                        >
                                            10:00 AM
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
                                            onClick={() => handleTimeSelect('10:30 AM')}
                                        >
                                            10:30 AM
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="flex items-center gap-2 mb-2">
                                    <Button variant="ghost" size="sm" onClick={() => setBookingStep('calendar')} className="pl-0 hover:pl-2 transition-all text-gray-500">
                                        <ChevronLeft className="w-4 h-4 mr-1" />
                                        Back to Calendar
                                    </Button>
                                </div>

                                <div className="mb-6">
                                    <h4 className="font-bold text-gray-900">Booking:</h4>
                                    <p className="text-gray-600">
                                        {format(selectedDate, 'M/d/yy')}, {selectedTime} (Asia/Calcutta)
                                    </p>
                                </div>

                                <form className="space-y-4" onSubmit={handleConfirmBooking}>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">First Name: <span className="text-gray-400 font-normal">(Required)</span></label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Last Name: <span className="text-gray-400 font-normal">(Required)</span></label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Organization <span className="text-gray-400 font-normal">(Required)</span></label>
                                        <input
                                            type="text"
                                            name="organization"
                                            value={formData.organization}
                                            onChange={handleInputChange}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Email: <span className="text-gray-400 font-normal">(Required)</span></label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2 relative">
                                        <label className="text-sm font-semibold text-gray-700">Phone number: <span className="text-gray-400 font-normal">(Required)</span></label>
                                        <div className="flex border border-gray-300 rounded-md overflow-visible bg-white relative z-50">
                                            <div
                                                className="flex items-center justify-center px-3 border-r bg-gray-50 border-gray-300 gap-1 cursor-pointer hover:bg-gray-100 min-w-[80px]"
                                                onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                                            >
                                                <img src={selectedCountry.flag} alt={selectedCountry.code} className="w-5 h-auto rounded-sm" />
                                                <span className="text-xs text-gray-500">▼</span>
                                            </div>

                                            {showCountryDropdown && (
                                                <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto z-50">
                                                    {countries.map((country) => (
                                                        <div
                                                            key={country.code}
                                                            className="flex items-center gap-3 p-2 hover:bg-gray-50 cursor-pointer"
                                                            onClick={() => {
                                                                setSelectedCountry(country);
                                                                setShowCountryDropdown(false);
                                                            }}
                                                        >
                                                            <img src={country.flag} alt={country.code} className="w-5 h-auto rounded-sm" />
                                                            <span className="text-sm text-gray-700">{country.name} ({country.dialCode})</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                className="flex-1 p-2 focus:outline-none"
                                                placeholder={`${selectedCountry.dialCode} ${selectedCountry.code === 'US' ? '201-555-0123' : '98765 43210'}`}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        <label className="text-sm font-bold text-gray-900">Where did you hear about Questbridge?</label>
                                        <div className="space-y-2">
                                            {['Google', 'ChatGPT', 'Referral', 'Event', 'Ads', 'Blog'].map((source) => (
                                                <div key={source} className="flex items-center gap-2">
                                                    <input
                                                        type="radio"
                                                        name="source"
                                                        id={source}
                                                        value={source}
                                                        checked={formData.source === source}
                                                        onChange={handleInputChange}
                                                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                    />
                                                    <label htmlFor={source} className="text-sm text-gray-600 cursor-pointer">{source}</label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2 pt-2">
                                        <label className="text-sm font-bold text-gray-900">Notes:</label>
                                        <textarea
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleInputChange}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 h-32 resize-none"
                                        />
                                    </div>

                                    <div className="text-sm text-gray-600 space-y-1">
                                        <p>Are you looking for our event management or broadcasting solution?</p>
                                        <p>How many people will be using the solution?</p>
                                        <p>What is your purchasing time frame/budget?</p>
                                        <p>What is the primary purpose of the platform and what features are you looking for?</p>
                                        <p>Are you looking for a technology provider or a full-service agency?</p>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-48 bg-teal-900 hover:bg-teal-800 text-white font-bold rounded-full py-6 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={isSending}
                                    >
                                        {isSending ? 'Sending...' : 'Confirm Booking'}
                                    </Button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookDemo;
