import { Instagram } from 'lucide-react'; // Keep Instagram from lucide-react

const TournamentFooter = () => {
  return (
    // Main container div with background and padding
    <div className="bg-slate-950 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Logo and Title Section */}
        <div className="flex flex-col md:flex-row items-center justify-center md:justify-start text-center md:text-left mb-10">
          {/*
            Replace this img tag with your actual logo.
            If your logo is an SVG or a different component, integrate it here.
            Update the src path to your logo file.
          */}
          <img
            src="/path/to/your/logo.png" // <--- !!! UPDATE THIS PATH !!!
            alt="National College Cup Logo"
            className="h-16 w-auto md:mr-6 mb-4 md:mb-0"
          />
          <div>
            {/* Adjusted title color based on the logo in the image */}
            <h2 className="text-2xl font-bold text-yellow-400 mb-1">NATIONAL COLLEGE CUP</h2>
            <p className="text-sm text-gray-300">
              The premier esport tournament for university students across the nation
            </p>
          </div>
        </div>

        {/* Social Media Section */}
        <div className="text-center mb-10">
          <p className="text-lg font-semibold mb-2">For more information</p>
          <p className="text-md text-gray-300 mb-6">Join our social media channels</p>
          <div className="flex justify-center gap-6">
            {/* Discord Icon (SVG) */}
            <a
              href="https://discord.gg/EWXeFK3VhP" // <--- !!! UPDATE WITH ACTUAL LINK !!!
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-[#5865F2] flex items-center justify-center transition-colors hover:bg-blue-700"
              aria-label="Discord"
            >
              {/* SVG code for Discord icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="white" // Set fill to white
                className="w-6 h-6" // Apply Tailwind size classes
              >
                <path d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.2 12.2 0 0 0-3.658 0 8 8 0 0 0-.412-.833.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257-.194a.05.05 0 0 0-.056.079c.359 1.745.674 3.46.938 5.164a1.13 1.13 0 0 0 .163.26.05.05 0 0 0 .056-.01c-.077-.165-.23-.38-.405-.601-.38-.486-1.036-1.129-1.65-1.786a.05.05 0 0 1-.009-.015c-.029-.023-.059-.049-.081-.087a.05.05 0 0 0-.019-.05.05.05 0 0 0-.002-.002Zm1.113 9.874a1.5 1.5 0 0 1-1.33.826.95.95 0 0 1-.666-.211c-.524-.41-.955-.91-.125-1.741.17-.174.336-.349.499-.524-.3-.053-.60-.108-.9-.169a.05.05 0 0 0-.046.012c-.14.234-.3.48-.46.73a1.52 1.52 0 0 1-1.415.92c-.807 0-1.5-.52-1.62-1.22a4.5 4.5 0 0 1-.2-.66c-.307-.055-.607-.107-.91-.16a.05.05 0 0 0-.045.014c-.162.25-.327.5-.493.752a1.52 1.52 0 0 1-1.407.919c-.807 0-1.5-.52-1.618-1.22a4.5 4.5 0 0 1-.19-.635c-1.4-.257-2.8-.572-4.17-.958a.05.05 0 0 0-.056.079c.359 1.745.674 3.46.938 5.164a1.13 1.13 0 0 0 .163.26.05.05 0 0 0 .056-.01c-.077-.165-.23-.38-.405-.601-.38-.486-1.036-1.129-1.65-1.786a.05.05 0 0 1-.009-.015c-.029-.023-.059-.049-.081-.087a.05.05 0 0 0-.019-.05.05.05 0 0 0-.002-.002Z"/>
              </svg>
            </a>
            {/* WhatsApp Icon (SVG) */}
            <a
              href="https://chat.whatsapp.com/K5BXRXVVy1N7lgCQSEzXey" // <--- !!! UPDATE WITH ACTUAL LINK !!!
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center transition-colors hover:bg-green-600"
              aria-label="WhatsApp"
            >
              {/* SVG code for WhatsApp icon */}
               <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="white" // Set fill to white
                  className="w-6 h-6" // Apply Tailwind size classes
                >
                  <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.601 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.434-.153-.232a6.6 6.6 0 0 1-1.04-3.84c0-3.668 2.953-6.64 6.601-6.64 1.899 0 3.66.73 5.012 2.074 1.352 1.344 2.077 3.118 2.077 5.013 0 3.668-2.953 6.64-6.601 6.64zm4.52-4.082c-.376-.187-1.856-.92-2.141-1.023-.285-.103-.493-.153-.701.154-.208.307-.813 1.023-1.001 1.22-.187.197-.376.263-.69.109-.315-.154-1.33-.492-2.535-1.562-1.205-1.07-2.012-2.392-2.241-2.791-.23-.398-.024-.617.189-.814.171-.165.38-.423.51-.631.129-.208.129-.398.09-.596-.04-.195-.376-.92-.511-1.22-.135-.295-.271-.257-.493-.263-.208-.006-.44-.006-.69-.006zm-5.621 5.88C2.51 14.35 1.59 13.33 1.1 12.15c-1.11-2.85-1.11-5.92 0-8.77 1.11-2.85 3.5-4.8 6.39-4.8s5.28 1.95 6.39 4.8c1.11 2.85 1.11 5.92 0 8.77-1.11 2.85-3.5 4.8-6.39 4.8z"/>
               </svg>
            </a>
            {/* Instagram Icon (Keep from lucide-react as requested) */}
            <a
              href="https://www.instagram.com/battleknightsindia?igsh=eGNuYXY5eDJucm9q" // <--- !!! UPDATE WITH ACTUAL LINK !!!
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FEDA77] via-[#F58529] to-[#DD2A7B] flex items-center justify-center transition-all hover:opacity-80"
              aria-label="Instagram"
            >
              <Instagram size={24} color="white" />
            </a>
          </div>
        </div>

        {/* Gradient Line */}
        {/* Approximate gradient line colors - adjust the colors (from, via, to) as needed */}
        <div className="w-48 h-1 mx-auto bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 mb-10"></div>

        {/* Copyright */}
        <div className="text-center text-gray-500 text-sm">
          <p>&copy; 2025 National College Cup ( Summer )</p>
        </div>
      </div>
    </div>
  );
};

export default TournamentFooter;
