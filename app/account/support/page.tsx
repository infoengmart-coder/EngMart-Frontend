'use client'

import { useState } from 'react'
import { useAccount, Inquiry } from '@/lib/account-context'
import { MessageSquare, Clock, CheckCircle, ArrowRight, CornerDownRight, Send } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function SupportInquiriesPage() {
  const { inquiries, addInquiry } = useAccount()
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  
  // Form State
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  // Find active selected ticket detail
  const selectedTicket = inquiries.find(t => t.id === selectedTicketId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !message.trim()) {
      alert('Please fill out both subject and inquiry message fields.')
      return
    }

    setIsSubmitting(true)
    setTimeout(() => {
      addInquiry(subject, message)
      setIsSubmitting(false)
      setSubject('')
      setMessage('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 leading-tight">Support Tickets</h2>
        <p className="text-xs text-slate-500 font-medium">Create and manage your industrial support tickets and technical sales queries here.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left column: Ticket history list & form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Submit New Inquiry Card */}
          <div className="bg-white border border-slate-200/85 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 mb-4">
              Submit New Inquiry
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {success && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold p-3.5 rounded-xl flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Inquiry submitted successfully! Our team will reply shortly.
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Query Subject / Reference *</label>
                <input
                  type="text" required
                  className="input-base text-xs font-semibold py-2.5"
                  placeholder="e.g. Contactor bulk order delivery timelines or Part mismatch"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Detailed Inquiry Message *</label>
                <textarea required rows={4}
                  className="input-base text-xs font-semibold py-2.5 resize-none h-28"
                  placeholder="Describe your technical question or shipping query in detail..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary text-xs px-5 py-2.5 flex items-center gap-1.5 border-0 shadow-none disabled:opacity-75"
                >
                  <Send className="w-4 h-4" /> {isSubmitting ? 'Submitting query...' : 'Submit Support Inquiry'}
                </button>
              </div>
            </form>
          </div>

          {/* Ticket lists */}
          <div className="bg-white border border-slate-200/85 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
              Past Support Inquiries
            </h3>

            {inquiries.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {inquiries.map(ticket => {
                  const isSelected = ticket.id === selectedTicketId
                  return (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedTicketId(isSelected ? null : ticket.id)}
                      className={`py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/40 px-2 rounded-xl transition-all ${
                        isSelected ? 'bg-slate-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          ticket.status === 'Open' ? 'bg-amber-50 text-amber-600' :
                          ticket.status === 'Replied' ? 'bg-indigo-50 text-indigo-600' :
                          'bg-emerald-50 text-emerald-600'
                        }`}>
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-primary leading-tight line-clamp-1">{ticket.subject}</h4>
                          <p className="text-[10px] text-slate-455 font-medium mt-1">
                            Ref: <span className="font-bold">{ticket.id}</span> • Submitted: {ticket.date}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 flex items-center gap-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          ticket.status === 'Open' ? 'bg-amber-100/60 text-amber-700' :
                          ticket.status === 'Replied' ? 'bg-indigo-150 text-indigo-700' :
                          'bg-emerald-100/60 text-emerald-700'
                        }`}>
                          {ticket.status}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-655">No inquiry logs.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Interactive ticket reply thread details */}
        <div className="lg:col-span-1 bg-white border border-slate-200/85 rounded-3xl p-6 shadow-sm min-h-[300px] flex flex-col">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 mb-4">
            Ticket Correspondence
          </h3>

          <AnimatePresence mode="wait">
            {selectedTicket ? (
              <motion.div
                key={selectedTicket.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-4 flex-1 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-4">
                    <span className="text-[10px] font-bold text-slate-900">{selectedTicket.id}</span>
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                      selectedTicket.status === 'Open' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                      selectedTicket.status === 'Replied' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                      'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    }`}>
                      {selectedTicket.status}
                    </span>
                  </div>

                  {/* Chat flow list */}
                  <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                    {selectedTicket.replies.map((reply, index) => {
                      const isAdmin = reply.sender === 'admin'
                      return (
                        <div key={index} className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}>
                          <div className={`max-w-[90%] rounded-2xl p-3 text-xs font-medium ${
                            isAdmin
                              ? 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/40'
                              : 'bg-primary text-white rounded-tr-none'
                          }`}>
                            <p className="leading-relaxed">{reply.message}</p>
                          </div>
                          <span className="text-[8px] font-bold text-slate-400 mt-1 px-1">
                            {reply.name} • {reply.timestamp}
                          </span>
                        </div>
                      )}
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 font-bold text-center">
                  Replies are managed by Eng-Mart Support.
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 py-12">
                <MessageSquare className="w-10 h-10 text-slate-200 mb-3" />
                <p className="text-xs font-bold text-slate-900">No Ticket Selected</p>
                <p className="text-[10px] text-slate-500 font-medium mt-1 leading-snug max-w-[180px]">
                  Click on any inquiry in the list to view the conversation history and administrator replies.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
