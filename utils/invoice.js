const { dateFormat, countUniqueDates, addDate } = require("../utils");

const invoice = {
  bookingInvoice(booking) {
    return `
    <html>
    <head>
      <style>
        *,
        ::after,
        ::before {
          box-sizing: border-box;
        }

        html {
          line-height: 1.15;
          -webkit-text-size-adjust: 100%;
        }

        body {
          margin: 0;
        }

        h1 {
          font-size: 2em;
          margin: 0.67em 0;
        }

        hr {
          box-sizing: content-box;
          height: 0;
          overflow: visible;
        }

        pre {
          font-family: monospace, monospace;
          font-size: 1em;
        }

        a {
          background-color: transparent;
        }

        abbr[title] {
          border-bottom: none;
          text-decoration: underline;
          -webkit-text-decoration: underline dotted;
          text-decoration: underline dotted;
        }
        b,
        strong {
          font-weight: bolder;
        }
        code,
        kbd,
        samp {
          font-family: monospace, monospace;
          font-size: 1em;
        }

        small {
          font-size: 80%;
        }

        sub,
        sup {
          font-size: 75%;
          line-height: 0;
          position: relative;
          vertical-align: baseline;
        }

        sub {
          bottom: -0.25em;
        }

        sup {
          top: -0.5em;
        }

        body,
        html {
          color: #777777;
          font-family: "Inter", sans-serif;
          font-size: 14px;
          font-weight: 400;
          line-height: 1.5em;
          overflow-x: hidden;
          background-color: #f5f7ff;
        }

        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
          clear: both;
          color: #111111;
          padding: 0;
          margin: 0 0 20px 0;
          font-weight: 500;
          line-height: 1.2em;
        }

        h1 {
          font-size: 60px;
        }

        h2 {
          font-size: 48px;
        }

        h3 {
          font-size: 30px;
        }

        h4 {
          font-size: 24px;
        }

        h5 {
          font-size: 18px;
        }

        h6 {
          font-size: 16px;
        }

        p,
        div {
          margin-top: 0;
          line-height: 1.5em;
        }

        p {
          margin-bottom: 15px;
        }

        ul {
          margin: 0 0 25px 0;
          padding-left: 20px;
          list-style: square outside none;
        }

        ol {
          padding-left: 20px;
          margin-bottom: 25px;
        }

        img {
          border: 0;
          max-width: 100%;
          height: auto;
          vertical-align: middle;
          border-style: none;
        }

        a {
          color: inherit;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        button {
          color: inherit;
          transition: all 0.3s ease;
        }

        table {
          width: 100%;
          caption-side: bottom;
          border-collapse: collapse;
        }

        th {
          text-align: left;
        }

        td {
          border-top: 1px solid #eaeaea;
        }

        td,
        th {
          padding: 10px 15px;
          line-height: 1.55em;
        }

        b,
        strong {
          font-weight: bold;
        }

        .f16 {
          font-size: 16px;
        }

        .semi_bold {
          font-weight: 600;
        }

        .bold {
          font-weight: 700;
        }

        .m0 {
          margin: 0px !important;
        }

        .mb0 {
          margin-bottom: 0px;
        }

        .mb1 {
          margin-bottom: 1px;
        }

        .mb2 {
          margin-bottom: 2px;
        }

        .mb5 {
          margin-bottom: 5px;
        }

        .mb10 {
          margin-bottom: 10px;
        }

        .width_1 {
          width: 8%;
        }

        .width_2 {
          width: 16.66666667%;
        }

        .width_3 {
          width: 25%;
        }

        .primary_color {
          color: #111111;
        }

        .focus_bg {
          background: #f6f6f6;
        }

        .container {
          max-width: 880px;
          padding: 30px 15px;
          margin-left: auto;
          margin-right: auto;
          z-index: 10;
        }

        .container.style1 {
          max-width: 400px;
        }

        .text_right {
          text-align: right;
        }

        .border_top_0 {
          border-top: 0;
        }

        .border_top {
          border-top: 1px solid #eaeaea;
        }

        .border_left {
          border-left: 1px solid #eaeaea;
        }

        .round_border {
          border: 1px solid #eaeaea;
          overflow: hidden;
          border-radius: 6px;
        }

        .border_none {
          border: none;
        }

        .invoice.style1 {
          background: #fff;
          border-radius: 10px;
          padding: 50px;
        }

        .invoice.style1 .invoice_head {
          display: flex;
          justify-content: space-between;
        }

        .invoice.style1 .invoice_head.type1 {
          align-items: flex-end;
          padding-bottom: 25px;
          border-bottom: 1px solid #eaeaea;
        }

        .invoice.style1 .invoice_footer {
          display: flex;
        }

        .invoice.style1 .invoice_footer table {
          margin-top: -1px;
        }

        .invoice.style1 .left_footer {
          width: 55%;
          padding: 10px 15px;
        }

        .invoice.style1 .right_footer {
          width: 46%;
        }

        .invoice.style1 .note {
          display: flex;
          align-items: flex-start;
          margin-top: 40px;
        }

        .invoice.style1 .note_left {
          margin-right: 10px;
          margin-top: 6px;
          margin-left: -5px;
          display: flex;
        }

        .invoice.style1 .note_left svg {
          width: 32px;
        }

        .invoice.style1 .invoice_left {
          max-width: 55%;
        }

        .table.style1.type1 {
          padding: 10px 30px;
        }

        .table.style1.type1 tr:first-child td {
          border-top: none;
        }

        .table.style1.type1 tr td:first-child {
          padding-left: 0;
        }

        .table.style1.type1 tr td:last-child {
          padding-right: 0;
        }

        .list.style1 {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .list.style1 li {
          display: flex;
        }

        .list.style1 li:not(:last-child) {
          border-bottom: 1px dashed #eaeaea;
        }

        .list.style1 li > * {
          flex: none;
          width: 50%;
          padding: 7px 0px;
        }

        .heading.style1 {
          line-height: 1.5em;
          border-top: 1px solid #eaeaea;
          border-bottom: 1px solid #eaeaea;
          padding: 10px 0;
        }

        .table.style1 .table.style1 tr:not(:first-child) td {
          border-color: #eaeaea;
        }

        .box.style1 {
          border: 2px solid #eaeaea;
          border-radius: 5px;
          padding: 20px 10px;
          min-width: 150px;
        }

        .box.style1.type1 {
          padding: 12px 10px 10px;
        }

        .logo {
          width: 150px;
        }
        .capitalize {
          text-transform: capitalize;
        }
        .text-center {
          margin-top: 50px;
          text-align: center;
        }
        .between {
          width: 100%;
          display: flex;
          justify-content: space-between;
        }
        .underline {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="invoice style1">
          <div class="invoice_in" id="download_section">
            <div class="invoice_head type1 mb25">
              <div class="invoice_left">
                <p class="invoice_number primary_color mb5 f16">
                  <b class="primary_color">Booking ID:</b> #${
                    booking.bookingNumber
                  }
                </p>
                <p class="invoice_date primary_color m0">
                  <b class="primary_color">Date: </b>${dateFormat(
                    booking.created_at,
                    "/"
                  )}
                </p>
                <p class="invoice_date primary_color m0">
                  <b class="primary_color">Payment status: </b
                  ><span class="capitalize">${booking.status}</span>
                </p>
              </div>
              <div class="invoice_right text_right">
                <div class="logo mb5">
                  <a href="${process.env.BASE_URL}">
                    <img
                      src="${process.env.BASE_URL}/full-logo.webp"
                      alt="Logo"
                      class="logo"
                    />
                  </a>
                </div>
              </div>
            </div>
            <div class="invoice_head mb10">
              <div class="invoice_left">
                <b class="primary_color">From:</b>
                <p>${booking?.userName}</p>
              </div>
              <div class="invoice_right text_right">
                <b class="primary_color">To:</b>
                <p>
                  Cholozai <br />
                  info@cholozai.com
                </p>
              </div>
            </div>
            <div class="table style1">
              <div class="round_border">
                <div>
                  <table>
                    <thead>
                      <tr>
                        <th class="width_3 semi_bold primary_color focus_bg">
                          Name
                        </th>
                        <th class="width_2 semi_bold primary_color focus_bg">
                          Room
                        </th>
                        <th class="width_2 semi_bold primary_color focus_bg">
                          Night
                        </th>
                        <th class="width_1 semi_bold primary_color focus_bg">
                          rate
                        </th>
                        <th class="width_1 semi_bold primary_color focus_bg">
                          Price
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      ${booking.rooms.map((room) => {
                        return `
                      <tr>
                        <td class="width_3">${room.name}</td>
                        <td class="width_2">${room.quantity}</td>
                        <td class="width_2">
                          ${countUniqueDates(
                            booking.checkIn,
                            addDate(-1, booking.checkOut)
                          )}
                        </td>
                        <td class="width_2">৳${room.price + room.discount}</td>
                        <td class="width_1">
                          ৳${
                            ((room.price || 0) + (room.discount || 0)) *
                            (room.quantity || 1) *
                            (countUniqueDates(
                              booking.checkIn,
                              addDate(-1, booking.checkOut)
                            ) || 1)
                          }
                        </td>
                      </tr>
                      `;
                      })}
                    </tbody>
                  </table>
                </div>
                <div class="invoice_footer border_top">
                  <div class="left_footer mobile_hide">
                    <p class="mb0">
                      <b class="primary_color">Additional Information:</b>
                    </p>
                    <p class="m0">
                      Pay by ${booking.paymentMethod} and this payment is ${
      booking.rooms.some((room) => !room.cancelStatus) ? "not" : ""
    }
                      refundable.
                    </p>
                  </div>
                  <div class="right_footer">
                    <table>
                      <tbody>
                        <tr class="border_left">
                          <td class="width_3 semi_bold primary_color focus_bg">
                            Subtotal
                          </td>
                          <td
                            class="width_3 semi_bold focus_bg primary_color text_right"
                          >
                            ৳${booking.totalRoomPrice}
                          </td>
                        </tr>
                        <tr class="border_left">
                          <td class="width_3 semi_bold primary_color focus_bg">
                            Tax
                          </td>
                          <td
                            class="width_3 semi_bold focus_bg primary_color text_right"
                          >
                            +৳${booking.totalTax}
                          </td>
                        </tr>
                        <tr class="border_left">
                          <td class="width_3 semi_bold primary_color focus_bg">
                            Discount
                          </td>
                          <td
                            class="width_3 semi_bold focus_bg primary_color text_right"
                          >
                            -৳${booking.totalDiscount}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div class="invoice_footer">
                <div class="left_footer mobile_hide"></div>
                <div class="right_footer">
                  <table>
                    <tbody>
                      <tr class="border_none">
                        <td class="width_3 border_top_0 bold f16 primary_color">
                          Total Amount
                        </td>
                        <td
                          class="width_3 border_top_0 bold f16 primary_color text_right"
                        >
                          ৳${booking.totalPayable}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div>
            <p class="text-center"><b>Need Help</b></p>
            <div class="between">
              <div>
                <p class="mb0"><b>Phone:</b></p>
                <a class="underline" href="tel:+8801595106884"> +8801595-106884</a>
              </div>
              <div>
                <p class="mb0"><b>Email:</b></p>
                <a class="underline" href="mailto:info@cholozai.com"> info@cholozai.com</a>
              </div>
              <div>
                <p class="mb0"><b>Whatsapp us</b></p>
                <a class="underline" href="https://wa.me/+8801595106884" target="_blank"
                  >+8801595106884</a
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </body>
  </html>
    `;
  },
};

module.exports = invoice;
