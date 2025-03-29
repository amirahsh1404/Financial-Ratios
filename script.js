class FormulaCalculator {
    constructor() {
        this.formulaElements = document.querySelectorAll('formula');
        this.init();
    }
    
    init() {
        document.querySelectorAll('input[type="number"], select').forEach(input => {
            input.addEventListener('input', () => {
                let sign = this.validateInput(input);
                if (sign) {
                    this.calculateAll();
                }
            });
        });
        
        document.getElementById('calculationType').addEventListener('change', () => {
            this.calcualteTypeEventListener();
            this.calculateAll();
        });
        
        this.calculateAll();
    }

    calcualteTypeEventListener() {
        const dpsGroup = document.getElementById('dividendPercentageGroup');
        const epsResult = document.getElementById('epsResult');
        const dpsResult = document.getElementById('dpsResult');

        if (this.getCalculationType() === 'dps') {
            dpsGroup.classList.remove('hidden');
            epsResult.classList.add('hidden');
            dpsResult.classList.remove('hidden');
        } else {
            dpsGroup.classList.add('hidden');
            epsResult.classList.remove('hidden');
            dpsResult.classList.add('hidden');
        }
    }
    
    getCalculationType() {
        return document.getElementById('calculationType').value;
    }
    
    validateInput(input) {
        const value = parseFloat(input.value);
        const errorElement = document.getElementById(`${input.id}Error`);
        
        errorElement.style.display = 'none';
        input.classList.remove('error');
        
        if (input.id === 'dividendPercentage') {
            if (isNaN(value) || value < 0 || value > 100) {
                input.classList.add('error');
                errorElement.textContent = 'لطفاً عددی بین 0 تا 100 وارد کنید';
                errorElement.style.display = 'block';
                return -1;
            }
            
        } else if (input.id === 'profit') {
            if (isNaN(value)) {
                input.classList.add('error');
                errorElement.textContent = 'لطفاً عددی وارد کنید؛ درصورت زیان‌ده بودن شرکت عددی منفی وارد کنید';
                errorElement.style.display = 'block';
                return -1;
            }
        } else {
            if (isNaN(value) || value <= 0) {
                input.classList.add('error');
                errorElement.textContent = 'لطفاً عددی مثبت وارد کنید';
                errorElement.style.display = 'block';
                return -1;
            }
        }
        return 1;
    }
    
    calculateAll() {
        this.formulaElements.forEach(formula => {
            this.calculateFormula(formula);
        });
        
        this.checkNav();
        this.checkDpsPercentage();
        this.checkEps();
        this.checkPe()
    }
    
    calculateFormula(formulaElement) {
        const expression = formulaElement.getAttribute('evaluator');
        const prefix = formulaElement.getAttribute('output-prefix') || '';    
        let evaluatedExpression = expression;
        const variables = expression.match(/[a-zA-Z]+/g) || [];
        variables.forEach(variable => {
            const inputElement = document.getElementById(variable);
            if (inputElement) {
                const value = inputElement.value ? parseFloat(inputElement.value) : 0;
                evaluatedExpression = evaluatedExpression.replace(new RegExp(variable, 'g'), value);
            }
        });

        const result = eval(evaluatedExpression);
        let formattedResult;
        if ((isNaN(result) || !isFinite(result)) || (result == 0 && (document.getElementById('profit').value == '' ))) {
            formattedResult = 'محاسبه ناممکن';
        } else {
            formattedResult = result.toLocaleString('fa-IR');
        }    
        formulaElement.textContent = prefix + formattedResult;
    }
    
    checkNav() {
        const assets = parseFloat(document.getElementById('assets').value) || 0;
        const shares = parseFloat(document.getElementById('shares').value) || 0;
        const price = parseFloat(document.getElementById('price').value) || 0;
        const nav = assets / shares;
        
        const navHighMessage = document.getElementById('navHighMessage');
        const navLowMessage = document.getElementById('navLowMessage');
        
        navHighMessage.style.display = 'none';
        navLowMessage.style.display = 'none';
        if (price > 0 && nav > 0 && !isNaN(nav) && isFinite(nav)) {
            if (price > nav) {
                navHighMessage.textContent = '⚠️ این سهم بالاتر از ارزش دارایی‌هایش معامله می‌شود';
                navHighMessage.style.display = 'block';
            } else if (price < nav) {
                navLowMessage.textContent = '✅ این سهم کمتر از ارزش ذاتی خود مبادله می‌شود';
                navLowMessage.style.display = 'block';
            }
        }
    }
    
    checkDpsPercentage() {
        if (this.getCalculationType() !== 'dps') {
            return
        }
        const dividendPercentage = parseFloat(document.getElementById('dividendPercentage').value) || 0;
        const sharesAvailable = document.getElementById('shares').value;
        const priceAvailabe = document.getElementById('price').value;
        const profitAvailable = document.getElementById('profit').value;

        const dpsMessage = document.getElementById('dpsMessage');
        dpsMessage.style.display = 'none'

        if ((sharesAvailable) != '' && priceAvailabe != '' && profitAvailable != '') {
            if (dividendPercentage < 40 && parseFloat(document.getElementById('profit').value) > 0) {
                dpsMessage.textContent = '💡 این شرکت سود کمی را برای سهامداران تقسیم می‌کند و بیشتر سود را به فعالیت‌های شرکت اختصاص می‌دهد';
                dpsMessage.style.display = 'block';
            } else {
                dpsMessage.style.display = 'none';
            }
        }
    }

    checkEps() {
        if (this.getCalculationType() !== "eps") {
            return
        }
        const shares = document.getElementById('shares').value;
        const profit = document.getElementById('profit').value;

        const epsMessage = document.getElementById('epsMessage');
        epsMessage.style.display = 'none'

        if (shares == '' || profit == '') {
            return
        }
        const eps = parseFloat(profit) / parseFloat(shares)

        if (eps > 250) {
            epsMessage.textContent = '📈 این شرکت وضعیت مناسبی از لحاظ تقسیم سود به هرسهم دارد و با بررسی جوانب دیگر شاید گزینۀ مناسبی باشد.'
            epsMessage.style.display = 'block'
        } else {
            epsMessage.textContent = '📉این شرکت وضعیت مناسبی در ساخت سود به ازای هرسهم ندارد؛ باید جوانب دیگر را نیز بررسی کنید.'
            epsMessage.style.display = 'block'
        }
    }

    checkPe() {
        
        const shares = document.getElementById('shares').value;
        const profit = document.getElementById('profit').value;
        const price = document.getElementById('price').value;

        const peMessage = document.getElementById('peMessage');
        peMessage.style.display = 'none'

        if (shares == '' || profit == '' || price =='') {
            return
        }
        const eps = parseFloat(profit) / parseFloat(shares)

        const pe = price / eps
        if (pe < 10) {
            peMessage.textContent = '📄 این شرکت ارزندگی زیادی به نسبت قیمت روی کاغذ دارد.'
            peMessage.style.display = 'block'
        } else {
            peMessage.textContent = '📊بهتر است فاکتورهای دیگر را نیز بررسی کنید.'
            peMessage.style.display = 'block'
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new FormulaCalculator();
});