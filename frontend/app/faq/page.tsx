import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { HelpCircle } from "lucide-react"

const faqs = [
  {
    question: "What is the Brampton Intra-Masjid Soccer League?",
    answer:
      "The Brampton Intra-Masjid Soccer League (BIMSL) is an inaugural 8-game round robin soccer league featuring teams from various masjids in Brampton. The league includes playoffs and runs from October 2025 to February 2026.",
  },
  {
    question: "When and where are the games played?",
    answer:
      "Games are played on Sunday nights between 8:30 PM and 11:00 PM at the Save Max Sports Centre, located at 1495 Sandalwood Pkwy E, Brampton, ON L6R 0K2. Some exceptions may apply to the schedule.",
  },
  {
    question: "How many teams participate in the league?",
    answer:
      "The league features 6 teams representing different masjids in Brampton. Each team plays 8 games in the round robin format, with the top 4 teams advancing to the playoffs.",
  },
  {
    question: "What is the league format?",
    answer:
      "The league follows an 8-game round robin format where each team plays every other team. After the round robin stage, the top 4 teams qualify for the playoffs to determine the league champion.",
  },
  {
    question: "How can I register my team?",
    answer:
      "Registration information will be announced soon. Please check back regularly or contact the league organizers for more information about team registration and requirements.",
  },
  {
    question: "Are spectators allowed at the games?",
    answer:
      "Yes, spectators are welcome to attend the games. We encourage family and community members to come out and support their teams. Please follow all venue rules and regulations.",
  },
  {
    question: "What are the rules and regulations?",
    answer:
      "The league follows standard FIFA rules with some modifications for indoor play. Full rules and regulations will be provided to all participating teams before the season begins.",
  },
  {
    question: "How are standings determined?",
    answer:
      "Standings are determined by points: 3 points for a win, 1 point for a draw, and 0 points for a loss. In case of a tie, goal difference, then goals scored, and finally head-to-head results are used as tiebreakers.",
  },
  {
    question: "What happens if a game is postponed?",
    answer:
      "If a game needs to be postponed due to weather or other circumstances, it will be rescheduled for a later date. All teams will be notified of any schedule changes as soon as possible.",
  },
  {
    question: "Is there a registration fee?",
    answer:
      "Registration fee information will be provided when registration opens. The fee helps cover venue costs, equipment, and league administration.",
  },
  {
    question: "What equipment do players need?",
    answer:
      "Players should wear appropriate soccer attire and indoor soccer shoes or athletic shoes. Shin guards are required for all players. The league will provide game balls.",
  },
  {
    question: "How can I stay updated on league news?",
    answer:
      "You can stay updated by regularly checking this website for schedules, scores, standings, and announcements. More information and communication channels will be announced soon.",
  },
]

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2 flex items-center justify-center gap-3">
            <HelpCircle className="h-10 w-10 text-primary" />
            Frequently Asked Questions
          </h1>
          <p className="text-foreground/70 text-lg">Everything you need to know about BIMSL</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border-b border-border/30">
                    <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-foreground/80 leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow mt-6">
            <CardHeader>
              <CardTitle>Still have questions?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/70 mb-4">
                If you have additional questions that aren't covered here, please reach out to the league organizers.
              </p>
              <p className="text-foreground/70">
                More contact information and communication channels will be available soon. Check back regularly for updates!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

