export async function sendDiscordNotification(data: {
  customerName: string
  customerEmail: string
  productName: string
  amount: number
  currency: string
  reason?: string
}) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL
  if (!webhookUrl) {
    console.log('Discord webhook URL not configured, skipping notification')
    return
  }

  const message = {
    content: `🚨 **Failed Payment Alert**`,
    embeds: [
      {
        title: 'New Failed Payment Detected',
        color: 0xff0000, // Red
        fields: [
          {
            name: 'Customer',
            value: `${data.customerName} (${data.customerEmail})`,
            inline: false,
          },
          {
            name: 'Product',
            value: data.productName,
            inline: true,
          },
          {
            name: 'Amount',
            value: `${data.currency} ${data.amount.toFixed(2)}`,
            inline: true,
          },
          ...(data.reason
            ? [
                {
                  name: 'Reason',
                  value: data.reason,
                  inline: false,
                },
              ]
            : []),
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    })

    if (!response.ok) {
      console.error('Failed to send Discord notification:', await response.text())
    }
  } catch (error) {
    console.error('Error sending Discord notification:', error)
  }
}

