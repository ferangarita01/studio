# WasteWise 🌱

**WasteWise** is a comprehensive waste management platform designed to help companies track, optimize, and report their waste disposal activities. Built with sustainability at its core, the platform combines advanced waste tracking with AI-powered optimization recommendations to reduce environmental impact and costs.

## ✨ Features

### Core Functionality
- **📊 Waste Entry Recording**: Track different waste types (Recycling, Organic, General, Hazardous) with detailed logging
- **📅 Disposal Scheduling**: Schedule and manage waste collection events with real-time status tracking
- **🤖 AI Waste Reduction Tool**: Powered by Google Gemini AI to analyze waste patterns and suggest optimization strategies
- **📈 Historical Data Visualization**: Interactive charts and reports showing waste trends over time
- **🏢 Company Dashboard**: Comprehensive overview of all waste-related activities and metrics
- **📋 Report Generation**: Automated report creation with customizable templates

### Advanced Features
- **💰 Financial Tracking**: Monitor disposal costs and potential revenue from recyclables
- **⚖️ Legal Compliance**: Ensure adherence to environmental regulations and standards
- **🔄 Material Management**: Detailed tracking of specific materials and their market values
- **🌍 Multi-language Support**: Available in English and Spanish
- **💳 Payment Integration**: MercadoPago and PayPal integration for plan upgrades
- **📱 Embeddable Widgets**: Share impact data through embeddable components

### User Management
- **👥 Multi-role System**: Admin and client user roles with appropriate permissions
- **🏢 Company Management**: Support for both individual and company accounts
- **💎 Subscription Plans**: Free, Premium, and Custom plans with different feature sets

## 🛠️ Technology Stack

- **Frontend**: Next.js 15.3.3 with React 18 and TypeScript
- **Styling**: Tailwind CSS with Radix UI components
- **Database**: Firebase Realtime Database
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage
- **AI Integration**: Google Genkit with Gemini 2.0 Flash model
- **Charts**: Recharts for data visualization
- **Internationalization**: Built-in i18n support (English/Spanish)
- **Payments**: MercadoPago and PayPal integration
- **Build Tool**: Next.js with Turbopack for development

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (version 18 or higher)
- npm or yarn package manager
- A Firebase project with Realtime Database enabled
- Google AI API key for Genkit integration

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd studio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Create a `.env.local` file in the root directory with the following variables:
   ```env
   # Google AI for Genkit
   GOOGLE_GENAI_API_KEY=your_google_ai_api_key

   # PayPal Integration
   NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id

   # MercadoPago Integration
   NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=your_mercadopago_public_key
   ```

   **Note**: Firebase configuration is currently hardcoded in `src/lib/firebase.ts`. For production deployments, consider moving these to environment variables.

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:9002`

### AI Development (Optional)

To work with the AI features separately:

```bash
# Start Genkit development server
npm run genkit:dev

# Or with auto-reload
npm run genkit:watch
```

## 📱 Usage

### For Administrators
1. **Company Setup**: Create and configure company profiles
2. **User Management**: Assign client users to companies
3. **Plan Management**: Upgrade companies to Premium or Custom plans
4. **System Oversight**: Monitor overall platform usage and performance

### For Company Users
1. **Waste Logging**: Record daily waste entries with type and quantity
2. **Schedule Collections**: Plan waste disposal events
3. **AI Insights**: Get recommendations for waste reduction
4. **Generate Reports**: Create financial and compliance reports
5. **Track Progress**: Monitor waste reduction goals and achievements

## 🏗️ Development

### Available Scripts

- `npm run dev` - Start development server with Turbopack (port 9002)
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run genkit:dev` - Start Genkit AI development server
- `npm run genkit:watch` - Start Genkit with auto-reload

### Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── [lang]/            # Internationalized routes
│   │   ├── companies/     # Company management
│   │   ├── dashboard/     # Main dashboard
│   │   ├── log/           # Waste entry logging
│   │   ├── reports/       # Report generation
│   │   └── ...           # Other feature pages
│   └── sitemap.ts         # SEO sitemap
├── components/            # Reusable React components
│   ├── ui/               # Base UI components (Radix UI)
│   └── layout/           # Layout components
├── lib/                  # Utility libraries
│   ├── firebase.ts       # Firebase configuration
│   ├── types.ts          # TypeScript type definitions
│   └── utils.ts          # Helper functions
├── ai/                   # AI/Genkit integration
├── services/             # Data services
├── dictionaries/         # i18n translation files
└── hooks/               # Custom React hooks
```

### Code Style

The project uses:
- **TypeScript** for type safety
- **Tailwind CSS** for styling with utility classes
- **ESLint** for code linting
- **Radix UI** for accessible component primitives
- **React Hook Form** with Zod validation for forms

## 🌍 Internationalization

The platform supports multiple languages:
- **English** (default)
- **Spanish**

Language files are located in `src/dictionaries/` and the configuration is in `src/i18n-config.ts`.

## 🚀 Deployment

### Firebase App Hosting

The project is configured for Firebase App Hosting with the configuration in `apphosting.yaml`.

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Firebase**
   Follow Firebase App Hosting deployment guidelines.

### Environment Variables for Production

Ensure all required environment variables are configured in your production environment:
- `GOOGLE_GENAI_API_KEY`
- `NEXT_PUBLIC_PAYPAL_CLIENT_ID`
- `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Ensure all components are accessible
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

## 📝 License

This project is private and proprietary. All rights reserved.

## 🆘 Support

For technical support or questions:
- Create an issue in this repository
- Contact the development team

## 🔄 Changelog

### Current Version (0.1.0)
- Initial release with core waste management features
- AI-powered waste reduction recommendations
- Multi-language support (EN/ES)
- Payment integration (PayPal/MercadoPago)
- Firebase backend integration

---

**Built with ❤️ for a sustainable future** 🌍
