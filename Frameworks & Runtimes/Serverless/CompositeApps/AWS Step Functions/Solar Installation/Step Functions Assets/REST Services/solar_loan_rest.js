/**
 * Return an array of various loan offers given a requested amount.
 * The amount is read from the Quote object in the payload (event).
 */
exports.handler = async (event) => {
    // Find the quote object in payload.
    const quote = event.Objects.find(obj => {
        return obj.__metadata["#type"] === "Quote";
    });
    const amount = parseFloat(quote["Value"]);

    const calcMonthlyPayment = function(amount, interest, duration) {
        let i = interest / 100 / 12;
        return amount * (i + i/((1 + i)**duration - 1));
    };
    
    let n = 1;
    const id = function() {
        return "LoanOption_id_" + n++;
    };
    
    const LoanOptions = [
    {
        "DurationMonths": 24,
        "DownPaymentPercent": 50,
        "Interest": 2.5,
        "Tier": 1,
        "AmortizedMonthlyPayment": calcMonthlyPayment(amount * .5, 2.5, 24),
        "__metadata": {
            "#type": "LoanOption",
            "#id": id()
        }
    },
    {
        "DurationMonths": 24,
        "DownPaymentPercent": 50,
        "Interest": 3.0,
        "Tier": 2,
        "AmortizedMonthlyPayment": calcMonthlyPayment(amount * .5, 3.0, 24),
        "__metadata": {
            "#type": "LoanOption",
            "#id": id()
        }
    },
    {
        "DurationMonths": 24,
        "DownPaymentPercent": 50,
        "Interest": 3.5,
        "Tier": 3,
        "AmortizedMonthlyPayment": calcMonthlyPayment(amount * .5, 3.5, 24),
        "__metadata": {
            "#type": "LoanOption",
            "#id": id()
        }
    },
    {
        "DurationMonths": 24,
        "DownPaymentPercent": 0,
        "Interest": 3.5,
        "Tier": 1,
        "AmortizedMonthlyPayment": calcMonthlyPayment(amount, 3.5, 24),
        "__metadata": {
            "#type": "LoanOption",
            "#id": id()
        }
    },
    {
        "DurationMonths": 24,
        "DownPaymentPercent": 0,
        "Interest": 4.0,
        "Tier": 2,
        "AmortizedMonthlyPayment": calcMonthlyPayment(amount, 4.0, 24),
        "__metadata": {
            "#type": "LoanOption",
            "#id": id()
        }
    },
    {
        "DurationMonths": 24,
        "DownPaymentPercent": 0,
        "Interest": 4.5,
        "Tier": 3,
        "AmortizedMonthlyPayment": calcMonthlyPayment(amount, 4.5, 24),
        "__metadata": {
            "#type": "LoanOption",
            "#id": id()
        }
    },
    {
        "DurationMonths": 60,
        "DownPaymentPercent": 50,
        "Interest": 4,
        "Tier": 1,
        "AmortizedMonthlyPayment": calcMonthlyPayment(amount * .5, 4, 60),
        "__metadata": {
            "#type": "LoanOption",
            "#id": id()
        }
    },
    {
        "DurationMonths": 60,
        "DownPaymentPercent": 50,
        "Interest": 4.5,
        "Tier": 2,
        "AmortizedMonthlyPayment": calcMonthlyPayment(amount * .5, 4.5, 60),
        "__metadata": {
            "#type": "LoanOption",
            "#id": id()
        }
    },
    {
        "DurationMonths": 60,
        "DownPaymentPercent": 50,
        "Interest": 5.0,
        "Tier": 3,
        "AmortizedMonthlyPayment": calcMonthlyPayment(amount * .5, 5.0, 60),
        "__metadata": {
            "#type": "LoanOption",
            "#id": id()
        }
    },
    {
        "DurationMonths": 60,
        "DownPaymentPercent": 0,
        "Interest": 5,
        "Tier": 1,
        "AmortizedMonthlyPayment": calcMonthlyPayment(amount, 5, 60),
        "__metadata": {
            "#type": "LoanOption",
            "#id": id()
        }
    },
    {
        "DurationMonths": 60,
        "DownPaymentPercent": 0,
        "Interest": 5.5,
        "Tier": 2,
        "AmortizedMonthlyPayment": calcMonthlyPayment(amount, 5.5, 60),
        "__metadata": {
            "#type": "LoanOption",
            "#id": id()
        }
    },
    {
        "DurationMonths": 60,
        "DownPaymentPercent": 0,
        "Interest": 6.0,
        "Tier": 3,
        "AmortizedMonthlyPayment": calcMonthlyPayment(amount, 6, 60),
        "__metadata": {
            "#type": "LoanOption",
            "#id": id()
        }
    }
    ];
    
    event.Objects = event.Objects.concat(LoanOptions);
    
    return event;
};
