import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { 
  ArrowRight, 
  Award, 
  Calendar, 
  Target, 
  TrendingUp, 
  Users, 
  Globe,
  BarChart3,
  CheckCircle,
  Clock,
  Star,
  BookOpen,
  University,
  Trophy,
  Medal,
  Flag
} from "lucide-react";

export const Route = createFileRoute("/university-award-strategy")({
  component: UniversityAwardStrategy,
});

function UniversityAwardStrategy() {
  const awardCriteria = [
    {
      category: "Innovazione Tecnologica",
      weight: "30%",
      trudeAdvantage: "Blockchain + AI per supply chain - prima al mondo",
      evidence: "Algoritmi arbitrage proprietari, 5 brevetti pending"
    },
    {
      category: "Impatto Economico",
      weight: "25%",
      trudeAdvantage: "$45B market opportunity, 0.1% commissioni",
      evidence: "Proiezioni $8.4M revenue Year 3, 10,000+ utenti target"
    },
    {
      category: "Sostenibilità ESG",
      weight: "20%",
      trudeAdvantage: "Carbon credits arbitrage, trasparenza totale",
      evidence: "Integrazione ESG, carbon footprint tracking, audit trail"
    },
    {
      category: "Scalabilità Globale",
      weight: "15%",
      trudeAdvantage: "5 blockchain, mercati globali, 2-15s execution",
      evidence: "Cross-chain infrastructure, 50+ paesi target"
    },
    {
      category: "Excellence Accademica",
      weight: "10%",
      trudeAdvantage: "Master in Supply Chain + 20 anni visione",
      evidence: "Tesi mai scritta su blockchain supply chain, ora realtà"
    }
  ];

  const timeline = [
    {
      phase: "Phase 1: Foundation",
      duration: "Mesi 1-3",
      tasks: [
        "Deploy smart contracts audit-ready",
        "Integrazione Pyth oracle completa",
        "Beta testing con 50 commodity traders",
        "Documentazione tecnica e whitepaper"
      ],
      deliverables: ["Smart contracts deployed", "Oracle integration", "Beta results", "Technical documentation"]
    },
    {
      phase: "Phase 2: Market Entry",
      duration: "Mesi 4-6",
      tasks: [
        "Lancio pubblico con 100 utenti",
        "Case studies con ROI reale",
        "Partnership con 3 aziende supply chain",
        "Presentazione a conferenze universitarie"
      ],
      deliverables: ["100 active users", "ROI case studies", "Industry partnerships", "Academic presentations"]
    },
    {
      phase: "Phase 3: Scale & Recognition",
      duration: "Mesi 7-12",
      tasks: [
        "1,000 utenti e $5M volume mensile",
        "Pubblicazione su riviste academiche",
        "Premi industria e riconoscimenti",
        "Preparazione candidatura award"
      ],
      deliverables: ["1,000 users", "$5M monthly volume", "Academic publications", "Award application"]
    }
  ];

  const competitiveAdvantages = [
    {
      title: "Primo al Mondo",
      description: "Prima piattaforma al mondo per arbitraggio commodities reali con blockchain",
      impact: "Unicorn potential, no competition diretta"
    },
    {
      title: "Tecnologia Premium",
      description: "2-15 secondi execution vs 2-15 minuti competitor, 0.1% vs 0.5-2% commissioni",
      impact: "20x più veloce, 20x più economico"
    },
    {
      title: "Visione 20 Anni",
      description: "Master Supply Chain + intuizione blockchain prima dell'esistenza di Bitcoin",
      impact: "Credibilità accademica e pensiero visionario"
    },
    {
      title: "Mercato $45B",
      description: "Commodity trading, trade finance, carbon credits - tutto integrato",
      impact: "Opportunità enorme con barriere alte"
    }
  ];

  const awardSubmissionStrategy = {
    narrative: "Da studente visionario a innovatore globale",
    keyPoints: [
      "20 anni fa volevo scrivere tesi su supply chain blockchain - ora è realtà",
      "Master in Supply Chain and Integrated Management - foundation perfetta",
      "Primo al mondo a combinare AI + Blockchain per arbitraggio commodities reali",
      "Tecnologia che democratizza accesso a mercati da $45B precedentemente riservati a istituzioni",
      "ESG integration con carbon credits - futuro sostenibile del trading"
    ],
    differentiators: [
      "Non solo teoria ma implementazione reale con utenti e revenue",
      "Audit trail immutabile per trasparenza totale",
      "Cross-chain infrastructure su 5 blockchain principali",
      "Success rate 78-92% vs 60-75% competitor",
      "Commissioni 0.1% vs 0.5-2% - democratizzazione accesso"
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 py-24">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600')] bg-cover bg-center opacity-20"></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center space-x-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
              <Trophy className="h-4 w-4 text-yellow-300" />
              <span className="text-sm font-medium text-white">University Award Strategy</span>
            </div>
            <h1 className="mb-6 text-5xl font-bold text-white sm:text-6xl lg:text-7xl">
              Premio Università Excellence
            </h1>
            <p className="mx-auto mb-8 max-w-4xl text-2xl font-semibold text-blue-100 sm:text-3xl">
              Da Visione Accademica a Realtà Industriale
            </p>
            <p className="mx-auto mb-12 max-w-3xl text-lg text-blue-50">
              "20 anni fa volevo fare tesi su supply chain blockchain - non esisteva. Oggi ho creato 
              TruDe, la prima piattaforma al mondo per arbitraggio commodities reali con tecnologia premium."
            </p>
            
            <div className="flex flex-wrap justify-center gap-6">
              <Link
                to="/supply-chain/demo"
                className="group flex items-center space-x-3 rounded-xl bg-white px-8 py-4 text-lg font-semibold text-slate-900 shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
              >
                <Trophy className="h-5 w-5" />
                <span>Dimostra l'Innovazione</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/university-award-strategy/timeline"
                className="group flex items-center space-x-3 rounded-xl border-2 border-white/30 bg-white/10 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                <Calendar className="h-5 w-5" />
                <span>Piano 12 Mesi</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Award Criteria Analysis */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-bold text-gray-900">Criteri di Valutazione</h2>
          <p className="mt-4 text-xl text-gray-600">Come TruDe domina ogni categoria</p>
        </div>

        <div className="space-y-8">
          {awardCriteria.map((criteria, index) => (
            <div key={index} className="rounded-3xl bg-white p-8 shadow-xl">
              <div className="grid gap-8 lg:grid-cols-3">
                <div>
                  <div className="mb-4 flex items-center space-x-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600">
                      <Star className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{criteria.category}</h3>
                      <p className="text-purple-600 font-semibold">{criteria.weight} del punteggio</p>
                    </div>
                  </div>
                  
                  <div className="rounded-xl bg-green-50 p-4">
                    <h4 className="mb-2 font-semibold text-green-800">Vantaggio TruDe:</h4>
                    <p className="text-sm text-green-700">{criteria.trudeAdvantage}</p>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <div className="rounded-xl bg-blue-50 p-4">
                    <h4 className="mb-2 font-semibold text-blue-800">Evidence Documentata:</h4>
                    <p className="text-sm text-blue-700">{criteria.evidence}</p>
                  </div>
                  
                  <div className="mt-4 flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Superiamo i criteri di valutazione</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 12-Month Timeline */}
      <div className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-bold text-gray-900">Timeline 12 Mesi per Award</h2>
            <p className="mt-4 text-xl text-gray-600">Da zero a candidatura excellence</p>
          </div>

          <div className="space-y-12">
            {timeline.map((phase, index) => (
              <div key={index} className="rounded-3xl bg-gradient-to-br from-slate-50 to-blue-50 p-8 shadow-xl">
                <div className="mb-8 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{phase.phase}</h3>
                      <p className="text-blue-600 font-semibold">{phase.duration}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">Obiettivi Chiave</div>
                    <div className="text-sm text-gray-600">{phase.deliverables.length} deliverables</div>
                  </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-2">
                  <div>
                    <h4 className="mb-4 text-lg font-semibold text-gray-900">Attività Principali:</h4>
                    <div className="space-y-3">
                      {phase.tasks.map((task, taskIndex) => (
                        <div key={taskIndex} className="flex items-start space-x-3">
                          <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-green-600" />
                          <span className="text-sm text-gray-700">{task}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-4 text-lg font-semibold text-gray-900">Deliverables Misurabili:</h4>
                    <div className="space-y-3">
                      {phase.deliverables.map((deliverable, delIndex) => (
                        <div key={delIndex} className="flex items-center space-x-3">
                          <Target className="h-5 w-5 text-blue-600" />
                          <span className="text-sm font-medium text-blue-700">{deliverable}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Competitive Advantages */}
      <div className="bg-gradient-to-br from-slate-900 to-blue-900 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-bold text-white">Vantaggi Competitivi</h2>
            <p className="mt-4 text-xl text-blue-100">Perché TruDe vincerà l'award</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {competitiveAdvantages.map((advantage, index) => (
              <div key={index} className="rounded-3xl bg-white/10 p-8 backdrop-blur-sm">
                <div className="mb-6 flex items-center space-x-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">{advantage.title}</h3>
                </div>
                
                <p className="mb-4 text-blue-100">{advantage.description}</p>
                
                <div className="rounded-xl bg-white/20 p-4">
                  <div className="text-sm font-semibold text-yellow-300">Impact:</div>
                  <div className="text-sm text-white">{advantage.impact}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Award Submission Strategy */}
      <div className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-bold text-gray-900">Strategia di Candidatura</h2>
            <p className="mt-4 text-xl text-gray-600">Narrativa vincente per l'award</p>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-purple-50 to-pink-50 p-8 shadow-xl">
            <div className="mb-8 text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-600">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">La Storia Vincente</h3>
              <p className="text-lg text-gray-600">{awardSubmissionStrategy.narrative}</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <h4 className="mb-4 text-lg font-semibold text-gray-900">Key Points Strategici:</h4>
                <div className="space-y-3">
                  {awardSubmissionStrategy.keyPoints.map((point, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Flag className="mt-1 h-5 w-5 flex-shrink-0 text-purple-600" />
                      <span className="text-sm text-gray-700">{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-4 text-lg font-semibold text-gray-900">Differentiatori Unici:</h4>
                <div className="space-y-3">
                  {awardSubmissionStrategy.differentiators.map((differentiator, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Star className="mt-1 h-5 w-5 flex-shrink-0 text-yellow-500" />
                      <span className="text-sm font-medium text-gray-800">{differentiator}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <Trophy className="h-10 w-10 text-yellow-300" />
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-6">
            Pronto per l'Excellence Award?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Abbiamo la tecnologia, la visione, e il piano per vincere. Il premio dell'università 
            non è solo un riconoscimento - è la validazione definitiva che TruDe sta rivoluzionando 
            la supply chain globale.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6">
            <Link
              to="/supply-chain/demo"
              className="group flex items-center space-x-3 rounded-xl bg-white px-8 py-4 text-lg font-semibold text-purple-900 shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
            >
              <University className="h-5 w-5" />
              <span>Dimostra l'Innovazione</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            
            <Link
              to="/competitor-analysis"
              className="group flex items-center space-x-3 rounded-xl border-2 border-white px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-white hover:text-purple-900"
            >
              <Target className="h-5 w-5" />
              <span>Strategia di Mercato</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          
          <div className="mt-12 flex items-center justify-center space-x-8 text-sm text-blue-200">
            <div className="flex items-center space-x-2">
              <Medal className="h-4 w-4 text-yellow-400" />
              <span>Excellence Recognition</span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-green-400" />
              <span>Global Impact</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              <span>Market Leadership</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}