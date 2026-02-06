import { Instagram, Twitter, Youtube, Mail, MapPin, Phone } from 'lucide-react';
export const Footer = () => {
  const socialLinks = [{
    icon: <Instagram className="w-5 h-5" />,
    href: '#',
    label: 'Instagram'
  }, {
    icon: <Twitter className="w-5 h-5" />,
    href: '#',
    label: 'Twitter'
  }, {
    icon: <Youtube className="w-5 h-5" />,
    href: '#',
    label: 'YouTube'
  }];
  const quickLinks = [{
    label: 'Events',
    href: '#events'
  }, {
    label: 'Schedule',
    href: '#schedule'
  }, {
    label: 'Passes',
    href: '#passes'
  }, {
    label: 'Register',
    href: '#register'
  }];
  return <footer className="relative pt-16 pb-8 px-4 border-t border-border/50">
      {/* Decorative top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="font-cinzel text-2xl font-bold text-foreground text-glow mb-4">
              EUPHORIA
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Rise from the depths of the ordinary into the extraordinary. 
              EUPHORIA 2026 awaits you in the Lost City of Atlantis.
            </p>
            <div className="flex gap-4">
              {socialLinks.map(link => <a key={link.label} href={link.href} aria-label={link.label} className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all duration-300 hover:shadow-[0_0_15px_hsl(var(--primary)/0.3)]">
                  {link.icon}
                </a>)}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-cinzel text-sm tracking-wider text-accent uppercase mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {quickLinks.map(link => <li key={link.label}>
                  <a href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </a>
                </li>)}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-cinzel text-sm tracking-wider text-accent uppercase mb-4">
              Contact Us
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-muted-foreground">
                <MapPin className="w-4 h-4 mt-1 text-primary" />
                <span className="text-sm">Government Medical College and Hospital, Chandigarh<br />
                  City, State - 000000
                </span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Mail className="w-4 h-4 text-primary" />
                <a href="mailto:euphoria@college.edu" className="text-sm hover:text-primary transition-colors">
                  euphoria@college.edu
                </a>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Phone className="w-4 h-4 text-primary" />
                <a href="tel:+910000000000" className="text-sm hover:text-primary transition-colors">
                  +91 00000 00000
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © 2026 EUPHORIA. All rights reserved.
          </p>
          <p className="text-muted-foreground/60 text-xs flex items-center gap-2">
            <span>Designed for</span>
            <span className="text-accent">EUPHORIA – Lost City of Atlantis</span>
          </p>
        </div>
      </div>
    </footer>;
};