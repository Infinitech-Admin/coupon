"use client";
import axios from "axios";
import type React from "react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import {
  ArrowLeft,
  ArrowRight,
  CalendarIcon,
  X,
  Star,
  Quote,
  Mail,
  Send,
  Bell,
  Clock,
  ChevronRight,
  Bookmark,
  Eye,
  ImageIcon,
  Calendar,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/cards";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/libs/utils";
import { HeroSection } from "@/components/hero-section";
import { SectionHeader } from "@/components/section-header";

import { LoadingIndicator } from "@/components/loading-indicator";
import { cardData, stats } from "@/libs/data";
import { toast } from "react-hot-toast";

interface Property {
  id: number;
  title: string;
  price: string;
  name: string;
  amenities: string;
  unit_type: string;
  bedrooms: number;
  location: string; // required!
  bathrooms: number;
  area: string;
  status: string;
  image: string;
  image_path: string;
  featured: boolean;
}

export default function Home() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [testimonialData, setTestimonialData] = useState<any[]>([]);
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [newsData, setNewsData] = useState<any[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [testimonialStyle, setTestimonialStyle] = useState<"slider" | "grid">(
    "slider",
  );
  const [activeNewsCategory, setActiveNewsCategory] = useState("All");

  // News article modal state
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);
  const [showArticleModal, setShowArticleModal] = useState(false);

  // Share Experience Form States
  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [name, setName] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [testimonialSliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    mode: "snap",
    slides: {
      perView: 1,
      spacing: 20,
    },
    breakpoints: {
      "(min-width: 640px)": {
        slides: { perView: 2, spacing: 20 },
      },
      "(min-width: 1024px)": {
        slides: { perView: 3, spacing: 30 },
      },
    },
    slideChanged(slider) {
      setActiveCardIndex(slider.track.details.rel);
    },
  });

  // Loading progress bar effect
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return newProgress;
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  // Fetch testimonials on mount
  useEffect(() => {
    async function fetchTestimonials() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/testimonials`,
        );
        if (!res.ok) throw new Error("Failed to fetch testimonials");
        const data = await res.json();
        setTestimonialData(data);
      } catch (error) {
        console.error("Error fetching testimonials:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTestimonials();
  }, []);

  // Fetch featured properties on mount
  useEffect(() => {
    async function fetchFeaturedProperties() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!baseUrl) throw new Error("NEXT_PUBLIC_API_URL is not defined");

        const res = await fetch(`${baseUrl}/api/properties`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to fetch properties");
        const data: Property[] = await res.json();
        const featured = data.filter((property) => property.featured);
        setFeaturedProperties(featured);
      } catch (error) {
        console.error("Error fetching featured properties:", error);
      }
    }
    fetchFeaturedProperties();
  }, []);

  // Fetch news items on mount
  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news`);
        if (!res.ok) throw new Error("Failed to fetch news");
        const data = await res.json();
        setNewsData(data);
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setNewsLoading(false);
      }
    }
    fetchNews();
  }, []);

  // Handle subscription with toast notifications
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/subscribe`,
        { email },
      );

      if (response.status === 200) {
        toast.success("Subscribed successfully!");
        setEmail("");
      }
    } catch (error: any) {
      // Check if the error is a response error from the server
      if (error.response) {
        if (error.response.status === 409) {
          // Email already taken (assuming your API returns 409 Conflict)
          toast.error("This email is already subscribed.");
        } else if (error.response.data && error.response.data.message) {
          // Show any other server message
          toast.error(error.response.data.message);
        } else {
          toast.error("Failed to subscribe. Please try again.");
        }
      } else {
        // Network or other errors
        toast.error("Failed to subscribe. Please try again.");
      }
      console.error("Error subscribing:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle testimonial submission
  const handleSubmitExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const data = {
      name: formData.get("name")?.toString() || "",
      date: date
        ? date.toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      message: formData.get("message")?.toString() || "",
    };

    try {
      // Add new testimonial using JSON format instead of FormData
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/testimonials`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        },
      );

      if (response.ok) {
        toast.success("Thank you for sharing your experience!");

        // Reset form
        setName("");
        setDate(new Date());
        setMessage("");
        setShowExperienceForm(false);

        // Refresh testimonials
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/testimonials`,
        );
        if (res.ok) {
          const data = await res.json();
          setTestimonialData(data);
        }
      } else {
        toast.error("Failed to submit. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting testimonial:", error);
      toast.error("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render stars based on rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${index < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
      />
    ));
  };

  // Get news categories
  const getNewsCategories = () => {
    const categories = new Set<string>();
    newsData.forEach((item) => {
      if (item.category) categories.add(item.category);
    });
    return ["All", ...Array.from(categories)];
  };

  // Filter news by category
  const getFilteredNews = () => {
    if (activeNewsCategory === "All") return newsData;
    return newsData.filter((item) => item.category === activeNewsCategory);
  };

  // Format date for news items
  const formatNewsDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (error) {
      return "";
    }
  };

  // Open article modal
  const openArticleModal = (article: any) => {
    setSelectedArticle(article);
    setShowArticleModal(true);
  };

  return (
    <>
      <HeroSection
        isLoading={isLoading}
        progress={progress}
        cardData={cardData}
        activeCardIndex={activeCardIndex}
        setActiveCardIndex={setActiveCardIndex}
      />

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        {isLoading ? (
          <LoadingIndicator progress={progress} />
        ) : (
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
              <div className="mb-4 md:mb-0">
                <SectionHeader
                  badge="Client Testimonials"
                  badgeColor="blue"
                  title="What Our Clients Say"
                  description="Discover why our clients trust us with their real estate services"
                />
              </div>

              <div className="flex items-center gap-2 mt-4 md:mt-0">
                <Button
                  variant={
                    testimonialStyle === "slider" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setTestimonialStyle("slider")}
                  className="text-xs"
                >
                  Slider View
                </Button>
                <Button
                  variant={testimonialStyle === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTestimonialStyle("grid")}
                  className="text-xs"
                >
                  Grid View
                </Button>
              </div>
            </div>

            {/* Grid Style - Alternative Design */}
            {testimonialStyle === "grid" && (
              <div className="mt-12">
                {testimonialData.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {testimonialData.map((testimonial, index) => {
                      const formattedDate = testimonial.date
                        ? format(new Date(testimonial.date), "MMM dd, yyyy")
                        : "";

                      return (
                        <motion.div
                          key={testimonial.id || index}
                          className="bg-white rounded-lg shadow-md overflow-hidden"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.5 }}
                        >
                          <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center">
                                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                                  {testimonial.avatar || testimonial.image ? (
                                    <img
                                      src={
                                        testimonial.avatar || testimonial.image
                                      }
                                      alt={testimonial.name}
                                      className="h-12 w-12 rounded-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-blue-600 font-bold text-lg">
                                      {testimonial.name?.charAt(0) || "A"}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <h4 className="font-semibold">
                                    {testimonial.name || "Anonymous"}
                                  </h4>
                                  <p className="text-sm text-gray-500">
                                    {testimonial.role ||
                                      testimonial.company ||
                                      "Verified Client"}
                                  </p>
                                </div>
                              </div>
                              <Quote className="h-8 w-8 text-blue-100" />
                            </div>

                            <div className="flex mb-3">
                              {renderStars(testimonial.rating || 5)}
                            </div>

                            <p className="text-gray-700 mb-4">
                              {(testimonial.text || testimonial.message || "")
                                .length > 150
                                ? `${(testimonial.text || testimonial.message || "").substring(0, 150)}...`
                                : testimonial.text || testimonial.message || ""}
                            </p>

                            {formattedDate && (
                              <p className="text-xs text-gray-400 mt-4">
                                {formattedDate}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <p>No testimonials available at the moment.</p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-12 text-center">
              <Button
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                onClick={() => setShowExperienceForm(true)}
              >
                Share Your Experience
              </Button>
            </div>

            {/* Share Your Experience Form */}
            {showExperienceForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <Card className="max-w-2xl w-full mx-auto">
                  <CardHeader className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-4"
                      onClick={() => setShowExperienceForm(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                    <CardTitle className="text-2xl font-bold">
                      Share Your Experience
                    </CardTitle>
                    <CardDescription>
                      Tell us about your experience with our real estate
                      services
                    </CardDescription>
                  </CardHeader>

                  <form onSubmit={handleSubmitExperience}>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Your Name</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="Enter your full name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="date">Date of Experience</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              id="date"
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !date && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {date ? format(date, "PPP") : "Select a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <div className="p-2 bg-white rounded-md shadow-md">
                              <div className="space-y-2">
                                <div className="grid grid-cols-7 gap-1">
                                  {["S", "M", "T", "W", "T", "F", "S"].map(
                                    (day, i) => (
                                      <div
                                        key={i}
                                        className="text-center text-xs font-medium text-gray-500"
                                      >
                                        {day}
                                      </div>
                                    ),
                                  )}
                                </div>
                                <div className="grid grid-cols-7 gap-1">
                                  {Array.from({ length: 31 }, (_, i) => {
                                    const day = i + 1;
                                    const currentDate = new Date();
                                    const isToday =
                                      day === currentDate.getDate();
                                    const isSelected =
                                      date && day === date.getDate();

                                    return (
                                      <Button
                                        key={i}
                                        variant="ghost"
                                        className={cn(
                                          "h-8 w-8 p-0 font-normal",
                                          isToday && "bg-gray-100",
                                          isSelected &&
                                            "bg-blue-600 text-white hover:bg-blue-700",
                                        )}
                                        onClick={() => {
                                          const newDate = new Date();
                                          newDate.setDate(day);
                                          setDate(newDate);
                                        }}
                                      >
                                        {day}
                                      </Button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Your Message</Label>
                        <Textarea
                          id="message"
                          name="message"
                          placeholder="Please share your experience with us"
                          className="min-h-[150px]"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          required
                        />
                      </div>
                    </CardContent>

                    <CardFooter>
                      <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={isSubmitting}
                      >
                        {isSubmitting
                          ? "Submitting..."
                          : "Submit Your Experience"}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <h3 className="text-4xl md:text-5xl font-bold mb-2">
                  {stat.number}
                </h3>
                <p className="text-blue-100">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Redesigned News Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div className="mb-4 md:mb-0">
                <h2 className="text-3xl font-bold text-gray-900">
                  Latest News & Insights
                </h2>
                <p className="text-gray-600 mt-2">
                  Stay informed with the latest real estate trends and market
                  updates
                </p>
              </div>

              <Button
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
              >
                View All Articles
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* News Categories */}
            <div className="flex flex-wrap gap-2 mb-8">
              {getNewsCategories().map((category, index) => (
                <Button
                  key={index}
                  variant={
                    activeNewsCategory === category ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setActiveNewsCategory(category)}
                  className={`rounded-full ${
                    activeNewsCategory === category
                      ? "bg-blue-600 text-white"
                      : "border-gray-300 text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {newsLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Featured News (First Item) */}
              {getFilteredNews().length > 0 && (
                <div className="lg:col-span-8 lg:row-span-2">
                  <motion.div
                    className="group relative h-full bg-white rounded-xl shadow-md overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="relative h-80 overflow-hidden bg-gray-100">
                      {getFilteredNews()[0].image ? (
                        <img
                          src={
                            getFilteredNews()[0].image
                              ? `${process.env.NEXT_PUBLIC_API_URL}/${getFilteredNews()[0].image}`
                              : "/placeholder.svg"
                          }
                          alt={getFilteredNews()[0].title || "News Image"}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <ImageIcon className="h-16 w-16 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 p-6 text-white">
                        <div className="flex items-center mb-3">
                          <span className="bg-blue-600 text-xs font-semibold px-3 py-1 rounded-full">
                            {getFilteredNews()[0].category || "News"}
                          </span>
                          <span className="flex items-center text-xs ml-3">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatNewsDate(getFilteredNews()[0].date)}
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold mb-2">
                          {getFilteredNews()[0].title}
                        </h3>
                        <p className="text-gray-200 line-clamp-2">
                          {getFilteredNews()[0].excerpt ||
                            getFilteredNews()[0].description}
                        </p>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden mr-3 flex items-center justify-center">
                            {getFilteredNews()[0].author?.avatar ? (
                              <img
                                src={
                                  getFilteredNews()[0].author.avatar ||
                                  "/placeholder.svg"
                                }
                                alt={
                                  getFilteredNews()[0].author?.name || "Author"
                                }
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-gray-500 font-bold">
                                {(
                                  getFilteredNews()[0].author?.name || "A"
                                ).charAt(0)}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {getFilteredNews()[0].author?.name ||
                                "Editorial Team"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {getFilteredNews()[0].author?.role || "Writer"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center text-gray-500 text-sm">
                            <Eye className="h-4 w-4 mr-1" />
                            {getFilteredNews()[0].views || "124"}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-500 hover:text-blue-600"
                          >
                            <Bookmark className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-6">
                        <Button
                          variant="link"
                          className="text-blue-600 hover:text-blue-800 p-0 h-auto font-medium flex items-center"
                          onClick={() => openArticleModal(getFilteredNews()[0])}
                        >
                          Read Full Article
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Secondary News Items */}
              <div className="lg:col-span-4 space-y-8">
                {getFilteredNews()
                  .slice(1, 3)
                  .map((newsItem, index) => (
                    <motion.div
                      key={index}
                      className="group bg-white rounded-xl shadow-sm overflow-hidden flex flex-col h-full"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * (index + 1), duration: 0.5 }}
                    >
                      <div className="relative h-48 overflow-hidden bg-gray-100">
                        {newsItem.image ? (
                          <img
                            src={
                              newsItem.image
                                ? `${process.env.NEXT_PUBLIC_API_URL}/${newsItem.image}`
                                : "/placeholder.svg"
                            }
                            alt={newsItem.title || "News Image"}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <ImageIcon className="h-10 w-10 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute top-0 left-0 p-3">
                          <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                            {newsItem.category || "News"}
                          </span>
                        </div>
                      </div>
                      <div className="p-5 flex-grow">
                        <div className="flex items-center text-xs text-gray-500 mb-3">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{formatNewsDate(newsItem.date)}</span>
                        </div>
                        <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {newsItem.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-3">
                          {newsItem.excerpt || newsItem.description}
                        </p>
                      </div>
                      <div className="px-5 pb-5 mt-auto">
                        <Button
                          variant="link"
                          className="text-blue-600 hover:text-blue-800 p-0 h-auto font-medium flex items-center"
                          onClick={() => openArticleModal(newsItem)}
                        >
                          Read More
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
              </div>

              {/* Additional News Items */}
              {getFilteredNews()
                .slice(3)
                .map((newsItem, index) => (
                  <motion.div
                    key={index}
                    className="lg:col-span-4 group bg-white rounded-xl shadow-sm overflow-hidden flex flex-col"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * (index + 3), duration: 0.5 }}
                  >
                    <div className="relative h-48 overflow-hidden bg-gray-100">
                      {newsItem.image ? (
                        <img
                          src={newsItem.image || "/placeholder.svg"}
                          alt={newsItem.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <ImageIcon className="h-10 w-10 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute top-0 left-0 p-3">
                        <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                          {newsItem.category || "News"}
                        </span>
                      </div>
                    </div>
                    <div className="p-5 flex-grow">
                      <div className="flex items-center text-xs text-gray-500 mb-3">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{formatNewsDate(newsItem.date)}</span>
                      </div>
                      <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {newsItem.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-3">
                        {newsItem.excerpt || newsItem.description}
                      </p>
                    </div>
                    <div className="px-5 pb-5 mt-auto">
                      <Button
                        variant="link"
                        className="text-blue-600 hover:text-blue-800 p-0 h-auto font-medium flex items-center"
                        onClick={() => openArticleModal(newsItem)}
                      >
                        Read More
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </motion.div>
                ))}

              {getFilteredNews().length === 0 && (
                <div className="lg:col-span-12 py-16 text-center bg-white rounded-xl shadow-sm">
                  <p className="text-gray-500">
                    No news articles available in this category.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Redesigned Newsletter Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {/* Left Content */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-8 md:p-12 md:w-1/2">
                <div className="flex items-center mb-6">
                  <div className="bg-white bg-opacity-20 rounded-full p-3 mr-4">
                    <Bell className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold">Stay Updated</h3>
                </div>

                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Subscribe to our Newsletter
                </h2>
                <p className="text-blue-100 mb-6">
                  Get the latest property listings, market trends, and exclusive
                  offers delivered straight to your inbox.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-white bg-opacity-20 rounded-full p-1 mr-3 mt-0.5">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                    <p className="text-sm">
                      New property listings before they hit the market
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-white bg-opacity-20 rounded-full p-1 mr-3 mt-0.5">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                    <p className="text-sm">
                      Exclusive offers and promotions for subscribers
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-white bg-opacity-20 rounded-full p-1 mr-3 mt-0.5">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                    <p className="text-sm">
                      Market insights and real estate investment tips
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Form */}
              <div className="p-8 md:p-12 md:w-1/2 flex flex-col justify-center">
                <div className="max-w-md mx-auto w-full">
                  <h3 className="text-xl font-semibold mb-2">
                    Join Our Community
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Enter your email address below to subscribe to our
                    newsletter.
                  </p>

                  <form onSubmit={handleSubscribe} className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Your email address"
                        className="pl-10 py-6 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        disabled={loading}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 flex items-center justify-center"
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          <span>Subscribing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <span>Subscribe Now</span>
                          <Send className="ml-2 h-4 w-4" />
                        </div>
                      )}
                    </Button>

                    <p className="text-xs text-gray-500 text-center">
                      We respect your privacy. Unsubscribe at any time.
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Article Modal */}
      {showArticleModal && selectedArticle && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-hidden"
          onClick={() => setShowArticleModal(false)}
        >
          <div
            className="flex items-center justify-center min-h-screen p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-30">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm text-gray-800 hover:bg-white shadow-md z-50"
                  onClick={() => setShowArticleModal(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="relative">
                <div className="h-64 md:h-80 overflow-hidden bg-gray-100">
                  {selectedArticle.image ? (
                    <img
                      src={
                        selectedArticle.image
                          ? `${process.env.NEXT_PUBLIC_API_URL}/${selectedArticle.image}`
                          : "/placeholder.svg"
                      }
                      alt={selectedArticle.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <ImageIcon className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent pointer-events-none"></div>
                </div>

                <div className="p-6 md:p-8">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      {selectedArticle.category || "News"}
                    </span>
                    <span className="bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatNewsDate(selectedArticle.date)}
                    </span>
                    {selectedArticle.readTime && (
                      <span className="bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {selectedArticle.readTime} min read
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl md:text-3xl font-bold mb-4">
                    {selectedArticle.title}
                  </h1>

                  {selectedArticle.author && (
                    <div className="flex items-center mb-6 border-b border-gray-200 pb-6">
                      <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden mr-3 flex items-center justify-center">
                        {selectedArticle.author.avatar ? (
                          <img
                            src={
                              selectedArticle.author.avatar ||
                              "/placeholder.svg"
                            }
                            alt={selectedArticle.author.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {selectedArticle.author.name || "Editorial Team"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {selectedArticle.author.role || "Writer"}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="prose prose-blue max-w-none">
                    {selectedArticle.content ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: selectedArticle.content,
                        }}
                      />
                    ) : (
                      <>
                        <p className="text-gray-700 mb-4 leading-relaxed">
                          {selectedArticle.description ||
                            selectedArticle.excerpt ||
                            ""}
                        </p>

                        {/* Generate some placeholder content if no real content exists */}
                        <p className="text-gray-700 mb-4 leading-relaxed">
                          The real estate market continues to evolve rapidly,
                          with new trends emerging that shape how people buy,
                          sell, and invest in properties. Understanding these
                          changes is crucial for anyone involved in the
                          industry, from first-time homebuyers to seasoned
                          investors.
                        </p>

                        <h2 className="text-xl font-semibold mt-6 mb-3">
                          Key Market Insights
                        </h2>

                        <p className="text-gray-700 mb-4 leading-relaxed">
                          Recent data suggests that property values in prime
                          locations have seen steady growth despite economic
                          uncertainties. This resilience is attributed to
                          several factors, including limited housing supply in
                          desirable areas and continued low interest rates that
                          make financing more accessible.
                        </p>

                        <p className="text-gray-700 mb-4 leading-relaxed">
                          Experts predict that this trend will continue through
                          the coming quarters, with particular strength in
                          suburban markets as remote work arrangements become
                          more permanent for many professionals.
                        </p>

                        <h2 className="text-xl font-semibold mt-6 mb-3">
                          What This Means For You
                        </h2>

                        <p className="text-gray-700 mb-4 leading-relaxed">
                          Whether you're looking to buy, sell, or invest,
                          staying informed about market conditions is essential.
                          Working with experienced real estate professionals who
                          understand local market dynamics can help you navigate
                          these complex decisions with confidence.
                        </p>

                        <p className="text-gray-700 mb-4 leading-relaxed">
                          For more detailed information or personalized advice,
                          please contact our team of experts who can provide
                          guidance tailored to your specific situation and
                          goals.
                        </p>
                      </>
                    )}
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          {selectedArticle.views || "124"} views
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                        >
                          <Bookmark className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                        onClick={() => setShowArticleModal(false)}
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </>
  );
}
